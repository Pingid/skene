import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha'
import * as cdk from 'aws-cdk-lib'

import { nodejsFunction } from './util'
import { AppStorage } from './Storage'
import { AppStack } from '../context'
import { Layer } from './Layer'

type ApiProps = { table: cdk.aws_dynamodb.Table; storage: AppStorage }

export const Api = (stack: AppStack, props: ApiProps) => {
  const api = new apigwv2.HttpApi(stack, stack.id('api'), {
    corsPreflight: {
      allowHeaders: ['Authorization'],
      allowMethods: [
        apigwv2.CorsHttpMethod.GET,
        apigwv2.CorsHttpMethod.HEAD,
        apigwv2.CorsHttpMethod.OPTIONS,
        apigwv2.CorsHttpMethod.POST,
        apigwv2.CorsHttpMethod.PUT,
      ],
      allowOrigins: ['*'],
      maxAge: cdk.Duration.days(10),
    },
  })

  const lambda_layer = Layer(stack, { name: 'webtorrent' })

  // Download
  const download = nodejsFunction(stack, 'src/functions/download.handler', {
    bundling: { externalModules: ['node-gyp-build', 'utp-native', 'torrent-search-api'] },
    layers: [lambda_layer.layer_from],
    timeout: cdk.Duration.minutes(10),
    ephemeralStorageSize: cdk.Size.gibibytes(5),
  })
  props.table.grantReadWriteData(download)
  download.addEnv('DYNAMODB_TORRENTS_TABLE_NAME', props.table.tableName)

  props.storage.bucket.grantReadWrite(download)
  download.addEnv('DOWNLOADS_BUCKET_NAME', props.storage.bucket.bucketName)

  // Trpc
  const trpc = nodejsFunction(stack, 'src/functions/trpc.handler', {
    bundling: { externalModules: ['node-gyp-build', 'utp-native', 'torrent-search-api'] },
    layers: [lambda_layer.layer_from],
  }).addRoute(api, {
    path: '/trpc/{proxy+}',
    methods: [apigwv2.HttpMethod.ANY],
  })
  props.table.grantReadWriteData(trpc)
  trpc.addEnv('DYNAMODB_TORRENTS_TABLE_NAME', props.table.tableName)

  download.grantInvoke(trpc)
  trpc.addEnv('START_DOWNLOAD_FUNCTION_NAME', download.functionName)

  return api
}
