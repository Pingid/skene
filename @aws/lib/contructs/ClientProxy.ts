import { transformSync } from 'esbuild'
import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'

import { AppStack } from '../context'

export const ClientProxy = (
  stack: AppStack,
  props: { httpApiId?: string; distribution: cdk.aws_cloudfront.Distribution },
) => {
  props.distribution.addBehavior(
    '/api/*',
    new cdk.aws_cloudfront_origins.HttpOrigin(`${props.httpApiId}.execute-api.eu-west-2.amazonaws.com`),
    {
      allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_ALL,
      cachePolicy: new cdk.aws_cloudfront.CachePolicy(stack, stack.id('ApiReverseProxyCachePolicy'), {
        maxTtl: cdk.Duration.seconds(1),
        minTtl: cdk.Duration.seconds(0),
        defaultTtl: cdk.Duration.seconds(0),
        cookieBehavior: cdk.aws_cloudfront.CacheCookieBehavior.all(),
        headerBehavior: cdk.aws_cloudfront.CacheHeaderBehavior.allowList('Authorization'),
        queryStringBehavior: cdk.aws_cloudfront.CacheQueryStringBehavior.all(),
      }),
      functionAssociations: [
        {
          function: new ViewerRequestCFunction(stack, stack.id('ApiReverseProxyUrlHandler'), {
            handler: (ev) => {
              ev.request.uri = ev.request.uri.replace('/api', '')
              return ev.request
            },
          }),
          eventType: cdk.aws_cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
      viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    },
  )
}

class ViewerRequestCFunction extends cdk.aws_cloudfront.Function {
  constructor(
    scope: Construct,
    id: string,
    props: {
      handler: (event: FunctionEvent) => Partial<FunctionEvent['response']> | Partial<FunctionEvent['request']>
      define?: Record<string, string>
    },
  ) {
    let code = transformSync(props.handler.toString(), {}).code
    Object.keys(props.define || {}).forEach((key) => {
      code = code.replace(key, (props.define as any)[key])
    })
    super(scope, id, {
      code: cdk.aws_cloudfront.FunctionCode.fromInline(`
          var handler_code = ${code}
          function handler(event) {
            return handler_code(event)
          }
        `),
    })
  }
}

type FunctionEvent = {
  version: string
  context: { eventType: string }
  viewer: { ip: string }
  request: {
    method: string
    uri: string
    querystring: Record<string, { value: string; multivalue?: { value: string }[] }>
    headers: Record<string, { value: string; multivalue?: { value: string }[] }>
    cookies: Record<string, { value: string; attributes: string; multivalue?: { value: string }[] }>
  }
  response: {
    statusCode: number
    statusDescription: string
    headers: Record<string, { value: string; multivalue?: { value: string }[] }>
    cookies: Record<string, { value: string; attributes: string; multivalue?: { value: string }[] }>
  }
}
