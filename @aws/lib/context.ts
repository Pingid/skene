import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

export type AppStackContext = {
  // App name used to label associated resources
  name: string
  // App stage (eg: staging, production)
  stage: string
  // Default Lambda function props
  defaultFunctionProps?: cdk.aws_lambda_nodejs.NodejsFunctionProps
  // Production flag
  production?: boolean
}

export type AppStackProps = cdk.StackProps & { ctx: AppStackContext }

export class AppStack extends cdk.Stack {
  // Function for labeling resources in this stack
  id: (name: string) => string
  ctx: AppStackContext
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props)
    this.ctx = props.ctx
    this.id = (value: string) => `${cap(props.ctx.name)}${cap(props.ctx.stage)}${cap(value)}`
  }
}

const cap = (x?: string) => (x ? x?.[0]?.toUpperCase() + x.slice(1) : '')

export const Outputs = <T extends Record<string, string | undefined>>(
  stack: AppStack,
  outputs: Record<string, string | undefined>,
) => {
  const oot: any = {}

  Object.keys(outputs).forEach((key) => {
    const value = outputs[key]
    if (typeof value === 'undefined') return
    oot[key] = new cdk.CfnOutput(stack, stack.id(`${key}Output`), { value, exportName: stack.id(`${key}Output`) })
  })

  return oot as { [K in keyof T]: cdk.CfnOutput }
}
