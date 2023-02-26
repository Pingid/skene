import type WebTorrent from 'webtorrent'
import querystring from 'querystring'
import path from 'path'
import fs from 'fs'

import type { Torrent } from '../../entities'

export type TorrentClient = Awaited<ReturnType<typeof createTorrentClient>>
export const createTorrentClient = async (ctx: { downloads_dir: string; options?: WebTorrent.Options }) => {
  const client = await import('webtorrent').then((x) => new x.default(ctx.options))

  const getData = (torrent: WebTorrent.Torrent): Torrent => {
    const files = (torrent?.files || []).map((x) => ({
      path: x.path,
      length: x.length,
      progress: x.progress,
      downloaded: x.downloaded,
    }))
    return {
      id: torrent.infoHash,
      files,
      hash: torrent.infoHash,
      magnet: torrent.magnetURI,
      peers: torrent.numPeers,
      running: !torrent.paused,
      speed: torrent.downloadSpeed,
      progress: torrent.progress * 100,
      remaining: torrent.timeRemaining,
    }
  }

  const addTrackers = (url: string) => `${url}&${querystring.encode({ tr: defaultTrackers })}`

  const add = async (magnet: string) => {
    const data = await parseTorrent(addTrackers(magnet))
    if (!data.infoHash) return Promise.reject(`Bad Torrent`)

    const torrent_dir = path.join(ctx.downloads_dir, `${data.infoHash}`)

    const torrent = await new Promise<WebTorrent.Torrent>((resolve) =>
      client.add(addTrackers(magnet), { path: torrent_dir }, resolve),
    )

    await fs.promises.writeFile(path.join(torrent_dir, `torrent.torrent`), torrent.torrentFile)

    return torrent
  }

  // Add all torrent files in directory
  await fs.promises
    .readdir(ctx.downloads_dir)
    .then((x) => x.map((y) => path.join(ctx.downloads_dir, y)))
    .then((x) => x.filter((y) => fs.statSync(y).isDirectory()))
    .then((x) =>
      Promise.all(
        x.map((y) => {
          return new Promise<WebTorrent.Torrent>((resolve) =>
            client.add(path.join(y, 'torrent.torrent'), { path: y }, resolve),
          )
        }),
      ),
    )

  return { client, add, getData }
}

const parseTorrent = async (magnet: string) => {
  const pt = await import('parse-torrent')
  return pt.default(magnet)
}

const defaultTrackers = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'udp://9.rarbg.com:2810/announce',
  'http://tracker.openbittorrent.com:80/announce',
  'udp://opentracker.i2p.rocks:6969/announce',
  'https://opentracker.i2p.rocks:443/announce',
  'udp://tracker1.bt.moack.co.kr:80/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.tiny-vps.com:6969/announce',
  'udp://tracker.theoks.net:6969/announce',
  'udp://tracker.skynetcloud.site:6969/announce',
  'udp://tracker.publictracker.xyz:6969/announce',
  'udp://tracker.monitorit4.me:6969/announce',
  'udp://tracker.moeking.me:6969/announce',
  'udp://tracker.lelux.fi:6969/announce',
  'udp://tracker.dler.org:6969/announce',
  'udp://tracker.altrosky.nl:6969/announce',
  'udp://tracker-udp.gbitt.info:80/announce',
  'udp://public.tracker.vraphim.com:6969/announce',
  'udp://public.publictracker.xyz:6969/announce',
]
