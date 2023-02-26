import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

import * as entity from './types'

type Context = {
  db: DynamoDBDocument
  TableName: string
}

export const createStore = (ctx: Context) => {
  const add = (input: { id: string; name: string; magnetURI: string }) =>
    ctx.db.put({
      TableName: ctx.TableName,
      Item: entity.create(input),
      ConditionExpression: `attribute_not_exists(pk)`,
    })

  const get = (input: { id: string }) =>
    ctx.db
      .get({ TableName: ctx.TableName, Key: { pk: input.id } })
      .then((x) => (x.Item ? entity.Schema.parseAsync(x.Item) : null))

  const running = (input: { id: string }) =>
    ctx.db
      .get({ TableName: ctx.TableName, Key: { pk: input.id }, ProjectionExpression: 'running' })
      .then((x) => !!x.Item?.running)

  const list = (input: { from?: string; limit?: number }) =>
    ctx.db
      .scan({ TableName: ctx.TableName, ExclusiveStartKey: input.from ? (JSON.parse(input.from) as any) : undefined })
      .then((x) => ({
        items: (x.Items || []).map((x) => entity.Schema.parse(x)),
      }))

  const remove = (input: { id: string }) => ctx.db.delete({ TableName: ctx.TableName, Key: { pk: input.id } })

  const update = (input: { id: string } & Partial<entity.Type>) => {
    const updates = { ...input, updatedAt: new Date().toISOString() }
    const update_keys = Object.keys(updates).filter((x) => x !== 'id' && typeof (updates as any)[x] !== 'undefined')

    return ctx.db.update({
      TableName: ctx.TableName,
      Key: { pk: input.id },
      UpdateExpression: `SET ${update_keys.map((k) => `#${k} = :${k}`).join(', ')}`,
      ExpressionAttributeNames: Object.fromEntries(update_keys.map((k) => [`#${k}`, k])),
      ExpressionAttributeValues: Object.fromEntries(update_keys.map((k) => [`:${k}`, (updates as any)[k]])),
      ReturnValues: 'ALL_NEW',
    })
  }

  return { add, remove, update, get, list, running }
}
