// utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@skene/aws/src'
export type { AppRouter } from '@skene/aws/src'
export const trpc = createTRPCReact<AppRouter>()
