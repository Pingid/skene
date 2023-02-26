import * as cdk from 'aws-cdk-lib'

import { AppStack } from '../context'

export const Storage = (stack: AppStack) => {
  const bucket = new cdk.aws_s3.Bucket(stack, stack.id('bucket'), {
    removalPolicy: stack.ctx.production ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
    autoDeleteObjects: !stack.ctx.production,
    cors: [
      {
        allowedMethods: [cdk.aws_s3.HttpMethods.POST],
        allowedOrigins: !stack.ctx.production ? ['http://localhost:3000'] : [],
        allowedHeaders: ['*'],
      },
    ],
  })

  const originAccessIdentity = new cdk.aws_cloudfront.OriginAccessIdentity(stack, stack.id(`BucketAccessIdentity`), {})
  bucket.grantRead(originAccessIdentity)

  const distribution = new cdk.aws_cloudfront.Distribution(stack, stack.id(''), {
    defaultBehavior: {
      origin: new cdk.aws_cloudfront_origins.S3Origin(bucket, { originAccessIdentity }),
      allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      responseHeadersPolicy: cdk.aws_cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
    },
  })

  return { bucket, distribution }
}

export type AppStorage = ReturnType<typeof Storage>
