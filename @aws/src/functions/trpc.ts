// import 'source-map-support/register'

import { CreateAWSLambdaContextOptions, awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda'
import { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

import { appRoutes } from '../trpc/router'
import { Context } from '../trpc/context'

// created for each request
export const createContext = ({
  event,
  context,
}: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2WithLambdaAuthorizer<{}>>): Context => {
  const lmbd = new LambdaClient({ region: process.env.AWS_REGION })
  // console.log(context.getRemainingTimeInMillis())
  return {
    db: DynamoDBDocument.from(new DynamoDBClient({ region: process.env.AWS_REGION })),
    TableName: process.env.DYNAMODB_TORRENTS_TABLE_NAME,
    start: (id) =>
      lmbd.send(
        new InvokeCommand({
          FunctionName: process.env.START_DOWNLOAD_FUNCTION_NAME,
          Payload: Buffer.from(JSON.stringify({ id }), 'utf-8'),
        }),
      ),
  }
}

export const handler = awsLambdaRequestHandler({ router: appRoutes, createContext })
