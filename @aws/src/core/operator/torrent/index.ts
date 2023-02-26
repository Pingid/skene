import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import pt from 'parse-torrent'
import * as z from 'zod'

import * as entity from '../../entity'
import * as util from '../../util'

export * from './download'
export * from './search'

type Context = {
  db: DynamoDBDocument
  TableName: string
}

export const add = util.operator(z.object({ magnetURI: z.string() }), async (ctx: Context, input) => {
  const store = entity.createStore(ctx)
  const result = await Promise.resolve(pt(input.magnetURI))
  result.announce
  if (!result.infoHash) return Promise.reject(new Error(`Bad magnet`))
  await store.torrent.add({ id: result.infoHash, name: `${result.name}`, magnetURI: input.magnetURI })
  return result
})

export const get = util.operator(z.object({ id: z.string() }), async (ctx: Context, input) => {
  const store = entity.createStore(ctx)
  return store.torrent.get(input)
})

export const list = util.operator(
  z.object({ from: z.string(), limit: z.number() }).partial(),
  async (ctx: Context, input) => {
    const store = entity.createStore(ctx)
    return store.torrent.list(input)
  },
)

export const stop = util.operator(z.object({ id: z.string() }), async (ctx: Context, input) => {
  const store = entity.createStore(ctx)
  const result = await store.torrent.update({ id: input.id, running: false })
  console.log('STOP', result)
  return result
})
