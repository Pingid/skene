import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha'
import * as cdk from 'aws-cdk-lib'

import { AppStack } from '../context'

export const nodejsFunction = (
  stack: AppStack,
  handler: string,
  config?: Partial<cdk.aws_lambda_nodejs.NodejsFunctionProps>,
) => {
  const [_entry, _handler] = handler.split('.')

  const func = new cdk.aws_lambda_nodejs.NodejsFunction(stack, stack.id(handler), {
    entry: `${_entry}.ts`,
    handler: _handler,
    ...stack.ctx.defaultFunctionProps,
    ...config,
  })

  const addRoute = (api: apigwv2.HttpApi, options: Omit<apigwv2.AddRoutesOptions, 'integration'>) => {
    api.addRoutes({
      integration: new HttpLambdaIntegration(`${stack.id(_handler)}Integration`, func),
      ...options,
    })

    return f
  }

  const addEnv = (key: keyof (typeof process)['env'], value: string) => {
    func.addEnvironment(key as string, value)
    return f
  }

  const f = Object.assign(func, { addRoute, addEnv })

  return f
}
