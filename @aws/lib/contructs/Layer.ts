import { spawnSync } from 'child_process'
import * as cdk from 'aws-cdk-lib'
import path from 'path'
import fs from 'fs'

import { AppStack } from '../context'

export const Layer = (stack: AppStack, props: { name: 'webtorrent' }) => {
  const layer_dir = path.join(process.cwd(), `./layers`)
  const layer_zip = path.join(layer_dir, `${props.name}/layer.zip`)

  if (!fs.existsSync(layer_zip)) {
    const result = spawnSync('sh', ['run.sh', props.name], {
      stdio: 'inherit',
      cwd: layer_dir,
    })
    if (result.status !== 0) throw result
  }

  const compatibleRuntimes = [
    cdk.aws_lambda.Runtime.NODEJS_14_X,
    cdk.aws_lambda.Runtime.NODEJS_16_X,
    cdk.aws_lambda.Runtime.NODEJS_18_X,
  ]

  const layer_version = new cdk.aws_lambda.LayerVersion(stack, stack.id(`${props.name}Layer`), {
    compatibleRuntimes,
    code: cdk.aws_lambda.Code.fromAsset(layer_zip),
  })

  const layer_from = cdk.aws_lambda.LayerVersion.fromLayerVersionAttributes(
    stack,
    stack.id(`${props.name}LayerVersion`),
    { compatibleRuntimes, layerVersionArn: layer_version.layerVersionArn },
  )

  return { layer_from, layer_version }
}
