import { observable } from '@trpc/server/observable'
import { z } from 'zod'

import { TypedEventEmitter } from '../../services/events'
import { Torrent } from '../../entities'
import { t, router } from '..'

const ee = new TypedEventEmitter<{
  add: [Torrent]
}>()

export const torrent = router({
  add: t.procedure.input(z.object({ magnet: z.string() })).mutation(async ({ input, ctx }) => {
    const torrent = await ctx.torrent.add(input.magnet)
    ee.emit('add', ctx.torrent.getData(torrent))
    return null
  }),
  get: t.procedure
    .input(z.string())
    .output(z.union([Torrent, z.null()]))
    .query(async ({ input, ctx }) => {
      const torrent = await ctx.torrent.client.get(input)
      return torrent ? ctx.torrent.getData(torrent) : null
    }),
  list: t.procedure
    .output(z.array(Torrent))
    .query(async ({ ctx }) => ctx.torrent.client.torrents.map(ctx.torrent.getData)),
  onList: t.procedure.subscription(({ ctx }) => {
    return observable<any>((emit) => {
      const handler = (data: any) => emit.next(data)
      ee.on('add', handler)
      return () => ee.off('add', handler)
    })
  }),
  onGet: t.procedure.input(z.string()).subscription(({ ctx, input }) => {
    return observable<any>((emit) => {
      let unsub = () => {}

      Promise.resolve(ctx.torrent.client.get(input)).then((torrent) => {
        if (!torrent) return
        const handler = () => {
          emit.next(ctx.torrent.getData(torrent))
        }
        const error = (e: string | Error) => {
          emit.next({ ...ctx.torrent.getData(torrent), error: typeof e === 'string' ? e : e.message })
        }

        torrent.on('download', handler)
        torrent.on('done', handler)
        torrent.on('error', error)
        unsub = () => {
          torrent.off('download', handler)
          torrent.off('done', handler)
          torrent.off('error', error)
        }
      })
    })
  }),
  start: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const torrent = await ctx.torrent.client.get(input)
    if (!torrent) return null
    torrent.resume()
    return ctx.torrent.getData(torrent)
  }),
  stop: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const torrent = await ctx.torrent.client.get(input)
    if (!torrent) return null
    torrent.pause()
    return ctx.torrent.getData(torrent)
  }),
})
