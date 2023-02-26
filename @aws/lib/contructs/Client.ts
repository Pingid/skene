import { execSync } from 'child_process'
import * as cdk from 'aws-cdk-lib'
import path from 'path'
import fs from 'fs'

import { AppStack } from '../context'

export const Client = (
  stack: AppStack,
  props: {
    dir: string
    dist?: string
    cmd?: string
    certificate?: cdk.aws_certificatemanager.Certificate | undefined
    domainNames?: string[] | undefined
  },
) => {
  const bucket = new cdk.aws_s3.Bucket(stack, stack.id('ClientBucket'), {
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
    objectOwnership: cdk.aws_s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
    blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
  })

  const static_content = path.join(props.dir, props.dist || 'dist')
  if (!fs.existsSync(static_content)) execSync(props.cmd || 'yarn build', { cwd: props.dir })
  new cdk.aws_s3_deployment.BucketDeployment(stack, stack.id('ClientBucketDeployment'), {
    destinationBucket: bucket,
    sources: [cdk.aws_s3_deployment.Source.asset(static_content)],
  })

  const originAccessIdentity = new cdk.aws_cloudfront.OriginAccessIdentity(
    stack,
    stack.id(`ClientBucketAccessIdentity`),
  )
  bucket.grantRead(originAccessIdentity)

  const distribution = new cdk.aws_cloudfront.Distribution(stack, stack.id('ClientBucketDistribution'), {
    defaultRootObject: 'index.html',
    certificate: props.certificate,
    domainNames: props.domainNames,
    defaultBehavior: {
      origin: new cdk.aws_cloudfront_origins.S3Origin(bucket, { originAccessIdentity }),
      allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
    },
  })

  return { bucket, distribution }
}
