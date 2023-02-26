import TorrentSearchApi from 'torrent-search-api'

import * as util from '../../util'
import * as z from 'zod'

const input = z.object({
  providers: z.array(z.string()).optional(),
  query: z.string(),
  category: z.string(),
  limit: z.number(),
})

const output = z.array(
  z
    .object({
      title: z.string(),
      time: z.string(),
      size: z.string(),
      magnet: z.string(),
      seeds: z.number(),
      peers: z.number(),
      desc: z.string(),
      imdb: z.string(),
      provider: z.string(),
    })
    .partial(),
)

export const search = util.operator(input, async (ctx, inp) => {
  TorrentSearchApi.enablePublicProviders()
  if (inp.providers) return TorrentSearchApi.search(inp.providers, inp.query, inp.category, inp.limit)
  return TorrentSearchApi.search(inp.query, inp.category, inp.limit)
})
export const searchOutput = output
