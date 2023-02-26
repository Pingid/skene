import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import 'source-map-support/register'
import log from 'lambda-log'
import { ops } from '../core'

export const handler = async (data: any) => {
  if (!log.options.tags) log.options.tags = []
  log.options.tags.push('download')

  const input = ops.torrent.download.input.parse(data)
  log.info(`toggle download`, { input })

  return ops.torrent.download(
    {
      db: DynamoDBDocument.from(new DynamoDBClient({ region: process.env.AWS_REGION })),
      TableName: process.env.DYNAMODB_TORRENTS_TABLE_NAME,
      Bucket: process.env.DOWNLOADS_BUCKET_NAME,
      s3: new S3Client({ region: process.env.AWS_REGION }),
    },
    input,
  )
}
