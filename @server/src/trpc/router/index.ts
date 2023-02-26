import { torrent } from './torrent'
import { router } from '..'

export type AppRouter = typeof appRouter

export const appRouter = router({
  torrent,
})
