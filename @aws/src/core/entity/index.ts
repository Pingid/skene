import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import * as torrent from './torrent'

export * as torrent from './torrent'
export * as magnet from './magnet'

type Context = {
  db: DynamoDBDocument
  TableName: string
}

export const createStore = (ctx: Context) => ({
  torrent: torrent.createStore(ctx),
})
