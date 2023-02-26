import { procedure, router } from './context'
import { ops, ent } from '../core'
import * as z from 'zod'

export const appRoutes = router({
  torrent: router({
    add: procedure.input(ops.torrent.add.input).mutation(({ ctx, input }) => ops.torrent.add(ctx, input)),
    start: procedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => ctx.start(input.id)),
    stop: procedure.input(ops.torrent.stop.input).mutation(({ ctx, input }) => ops.torrent.stop(ctx, input)),
    list: procedure
      .input(ops.torrent.list.input)
      .output(z.object({ items: z.array(ent.torrent.Schema) }))
      .query(({ ctx, input }) => ops.torrent.list(ctx, input)),
    get: procedure
      .input(ops.torrent.get.input)
      .output(z.union([z.null(), ent.torrent.Schema]))
      .query(({ ctx, input }) => ops.torrent.get(ctx, input)),
    search: procedure
      .input(ops.torrent.search.input)
      .output(ops.torrent.searchOutput)
      .query(({ input }) => ops.torrent.search({}, input)),
  }),
})
