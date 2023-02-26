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

  // Dns validation for route 53 requires that the certificate be in us-east-1
  // Hence this second stack just to create the certificate
  let certificate: cdk.aws_certificatemanager.Certificate | undefined = undefined
  let domainNames: string[] | undefined = undefined
  if (env.ROUTE53_DOMAIN) {
    const domainName = env.ROUTE53_DOMAIN

    const stack = new cdk.Stack(app, `skene-certificate`, {
      env: { region: 'us-east-1', account: env.AWS_ACCOUNT },
      crossRegionReferences: true,
    })

    const hostedZone = cdk.aws_route53.HostedZone.fromLookup(stack, `SkeneRout53HostedZone${env.AWS_STAGE}`, {
      domainName,
    })

    certificate = new cdk.aws_certificatemanager.Certificate(stack, 'SkeneRout53Certificate', {
      domainName,
      subjectAlternativeNames: [`www.${domainName}`],
      validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
    })

    domainNames = [`${domainName}`, `www.${domainName}`]
  }

  new SkeneStack(app, `skene-api-${env.AWS_STAGE}`, {
    crossRegionReferences: true,
    env: { region: env.AWS_REGION, account: env.AWS_ACCOUNT },
    ctx: {
      name: `skene`,
      stage: env.AWS_STAGE as string,
      certificate,
      domainNames,
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
