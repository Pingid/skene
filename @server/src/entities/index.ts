import * as z from 'zod'

export const TorrentFile = z.object({
  path: z.string(),
  length: z.number(),
  progress: z.number(),
  downloaded: z.number(),
})

export const Torrent = z.object({
  id: z.string(),
  hash: z.string(),
  magnet: z.string(),
  running: z.boolean(),
  files: z.array(TorrentFile),
  peers: z.number(),
  progress: z.number(),
  speed: z.number(),
  remaining: z.number(),
  error: z.string().optional(),
})

export type Torrent = z.TypeOf<typeof Torrent>
export type TorrentFile = z.TypeOf<typeof TorrentFile>
