import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { initTRPC } from '@trpc/server'
import * as z from 'zod'

export type Context = {
  db: DynamoDBDocument
  TableName: string
  start: (id: string) => Promise<any>
}

export const t = initTRPC.context<Context>().create()

export const router = t.router
export const procedure = t.procedure
export const list = <T extends z.ZodType>(x: T) => z.object({ items: z.array(x) })
