import { S3Client, ListObjectsCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import WebTorrent from 'webtorrent'
import { Readable } from 'stream'
import log from 'lambda-log'
import * as path from 'path'
import * as z from 'zod'
import * as fs from 'fs'

import * as entity from '../../entity'
import * as util from '../../util'

type Context = {
  db: DynamoDBDocument
  s3: S3Client
  Bucket: string
  TableName: string
}

export const download = util.operator(z.object({ id: z.string() }), async (ctx: Context, input) => {
  const store = entity.createStore(ctx)
  const item = await store.torrent.get(input)

  let time = Date.now()
  let last = 'Init'
  const lg = (msg: string, meta?: object | undefined) => {
    let diff = Date.now() - time
    log.info(msg, { ...meta, time: `${last} took ${(diff / 1000).toFixed(2)}s` })
    last = msg
  }

  lg('get data', item || {})

  if (!item) return Promise.reject(`Missing`)
  if (item.running) {
    await store.torrent.update({ id: input.id, running: false })
    return null
  }
  await store.torrent.update({ id: input.id, running: true })

  try {
    lg('clear directory /tmp')
    await fs.promises.rm(path.join('/tmp/downloads'), { recursive: true, force: true }).catch(() => null)

    // Setup Environment
    await store.torrent.update({ id: input.id, status: 'initializing' })
    lg('s3 download')
    await downloadWorkingFiles(ctx, input.id)

    // Start torrenting
    await store.torrent.update({ id: input.id, status: 'downloading' })
    await Promise.race([
      (async () => {
        lg('webtorrent')
        await startWebTorrent(ctx, { item, timeout: 1000 * 60 * 2 })
      })(),
      new Promise<void>((resolve) => setTimeout(() => resolve(), 1000 * 60 * 3)),
    ])

    // Cleanup environment
    await store.torrent.update({ id: input.id, status: 'saving' })
    lg('upload')
    await uploadWorkingFiles(ctx, input.id)

    // Done
    lg('finnished')
    await store.torrent.update({ id: input.id, running: false, status: 'idle' })
  } catch (e) {
    console.error(e)
    await store.torrent.update({ ...item, running: false, status: 'idle' })
  }

  return null
})

const startWebTorrent = async (ctx: Context, input: { item: entity.torrent.Type; timeout: number }) => {
  const store = entity.createStore(ctx)
  const client: WebTorrent.Instance = new WebTorrent({})
  const workdir = path.join('/tmp/downloads', input.item.id)

  log.info('webtorrent init')
  const torrent = await new Promise<WebTorrent.Torrent>((resolve) =>
    client.add(input.item.magnetURI, { path: workdir }, resolve),
  )
  const id = input.item.id

  log.info('load magnet')
  return new Promise<void>((resolve, reject) => {
    // Timeout after
    let destroyed = false
    const destroy = () => {
      if (destroyed) return resolve()
      return new Promise<void>(async (res) => {
        try {
          destroyed = true
          client.destroy(() => res())
        } catch (e) {
          res()
        }
      }).finally(() => resolve())
    }

    setTimeout(() => {
      log.error('webtorrent timeout')
      destroy()
      resolve()
    }, input.timeout)

    // Handle finnished
    torrent.on('done', async () => {
      await Promise.all([store.torrent.update({ id, finnished: true }).catch(console.error), destroy()])
      resolve()
    })

    // Handle Ready
    torrent.once('ready', async () => {
      log.info('torrent loaded', { ...getTorrentData(torrent), id })
      await store.torrent.update({ ...getTorrentData(torrent), id }).catch(console.error)
    })

    // Handle downloading
    const prog = throttle(1000, () => log.info(`downloading ${torrent.progress}`))
    const onSave = throttle(2000, async () => {
      store.torrent.update({ ...getTorrentData(torrent), id })
      const isRunning = await store.torrent.running({ id })
      if (!isRunning) return destroy()
    })
    torrent.on('download', async () => (prog(), onSave()))

    // Handle error
    torrent.once('error', async (e) => {
      log.error(e)
      await store.torrent.update({ error: JSON.stringify(e), id })
      resolve()
    })

    torrent.on('noPeers', () => log.info('now peers'))
  })
}

const getTorrentData = (torrent: WebTorrent.Torrent): Partial<entity.torrent.Type> => {
  const files = (torrent?.files || []).map((x) => ({
    path: x.path,
    length: x.length,
    progress: x.progress,
    downloaded: x.downloaded,
  }))
  return {
    files,
    numPeers: torrent.numPeers,
    paused: !torrent.paused,
    downloadSpeed: torrent.downloadSpeed,
    progress: torrent.progress * 100,
    timeRemaining: torrent.timeRemaining,
  }
}

const downloadWorkingFiles = async (ctx: Context, id: string) => {
  const existing = await ctx.s3.send(new ListObjectsCommand({ Bucket: ctx.Bucket, Prefix: `downloads/${id}` }))
  const keys = (existing.Contents || []).map((x) => x.Key).filter(Boolean)
  console.log(`Existing files for ${id}`, keys)
  await Promise.all(
    keys.map((Key) =>
      ctx.s3.send(new GetObjectCommand({ Bucket: ctx.Bucket, Key })).then(async (x) => {
        console.log(`Downloading`, Key)
        const dir = path.parse(path.join('/tmp', Key)).dir
        if (!(x.Body instanceof Readable)) return Promise.reject(new Error(`Bad object body ${Key}`))
        if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true })
        const write = fs.createWriteStream(path.join('/tmp', Key))
        x.Body.pipe(write)
        return new Promise<string>((resolve) => write.once('finish', () => resolve(Key)))
      }),
    ),
  )
}

const uploadWorkingFiles = async (ctx: Context, id: string) => {
  const workdir = path.join('/tmp/downloads', id)
  const files = await readAllFiles(workdir)
  log.info(`upload:file ${files.join(', ')}`)
  await Promise.all(
    files.map(async (file) => {
      log.info(`upload:file:start ${file}`)
      if (!fs.existsSync(file)) return log.error(`upload:file:missing ${file}`)
      const Body = fs.createReadStream(file)
      return ctx.s3
        .send(new PutObjectCommand({ Bucket: ctx.Bucket, Body, Key: path.relative('/tmp', file) }))
        .then(() => log.info(`upload:file:finnish ${file}`))
    }),
  )
}

const readAllFiles = (directory: string): Promise<string[]> =>
  fs.promises
    .readdir(directory)
    .then((x) =>
      Promise.all(
        x.map((y) =>
          fs.promises
            .stat(path.join(directory, y))
            .then((z) => (z.isDirectory() ? readAllFiles(path.join(directory, y)) : [path.join(directory, y)])),
        ),
      ).then((x) => x.flat(Infinity) as string[]),
    )

const stream2buffer = (stream: Readable): Promise<Buffer> =>
  new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>()
    stream.on('data', (chunk) => _buf.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(_buf)))
    stream.on('error', (err) => reject(`error converting stream - ${err}`))
  })

const throttle = <A extends any[], R>(delay: number, fn: (...args: A) => R) => {
  let shouldWait = false

  return (...args: A) => {
    if (shouldWait) return
    fn(...args)
    shouldWait = true
    setTimeout(() => {
      shouldWait = false
    }, delay)
  }
}
