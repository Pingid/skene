#!/usr/bin/env node
import 'source-map-support/register'

import { GetEnvVars } from 'env-cmd'
import * as cdk from 'aws-cdk-lib'

import { SkeneStack } from '../lib'

const run = async () => {
  const env = await GetEnvVars({ envFile: { filePath: '.env', fallback: true } })
    .then((x) => ({ ...process.env, ...x }))
    .catch(() => process.env)

  if (!env.AWS_STAGE) throw new Error(`Missing AWS_STAGE environment variable`)
  if (!env.AWS_REGION) throw new Error(`Missing AWS_REGION environment variable`)

  const app = new cdk.App()
  new SkeneStack(app, `skene-api-${env.AWS_STAGE}`, {
    env: { region: env.AWS_REGION, account: env.AWS_ACCOUNT },
    ctx: {
      name: `skene`,
      stage: env.AWS_STAGE as string,
      defaultFunctionProps: {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        architecture: env.ARM_64 ? cdk.aws_lambda.Architecture.ARM_64 : undefined,
        depsLockFilePath: 'package.json',
        logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
        bundling: {
          minify: false,
          sourceMap: true,
          sourceMapMode: cdk.aws_lambda_nodejs.SourceMapMode.INLINE,
        },
        memorySize: 4096,
        // timeout: cdk.Duration.seconds(29),
      },
    },
  })
}

run()
