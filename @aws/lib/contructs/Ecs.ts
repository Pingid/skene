import * as cdk from 'aws-cdk-lib'

import { AppStack } from '../context'

export const Ecs = (stack: AppStack, props: { bucket: cdk.aws_s3.IBucket }) => {
  const user = new cdk.aws_iam.User(stack, stack.id('EcsUser'), { managedPolicies: [] })
  const bucket_policy_statement = new cdk.aws_iam.PolicyStatement({
    effect: cdk.aws_iam.Effect.ALLOW,
    resources: [props.bucket.bucketArn, props.bucket.arnForObjects('*')],
    actions: ['s3:*'],
  })
  const managed_policy = cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
    'service-role/AmazonECSTaskExecutionRolePolicy',
  )
  const taskRole = new cdk.aws_iam.Role(stack, stack.id('EcsTaskRole'), {
    roleName: 'BackendECSTaskRole',
    assumedBy: new cdk.aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    managedPolicies: [managed_policy],
  })

  taskRole.addToPolicy(bucket_policy_statement)
  user.addManagedPolicy(managed_policy)

  const access_key = new cdk.aws_iam.AccessKey(stack, stack.id('EcsUserAccessKey'), { user })
  const access_key_secret = new cdk.aws_secretsmanager.Secret(stack, stack.id('EcsUserAccessKeySecret'), {
    secretStringValue: access_key.secretAccessKey,
  })

  const image = new cdk.aws_ecr_assets.DockerImageAsset(stack, stack.id('EcsImage'), { directory: './plex' })

  const broadcast = new cdk.aws_ecs_patterns.ApplicationLoadBalancedFargateService(
    stack,
    stack.id('EcsFargateService'),
    {
      taskImageOptions: {
        image: cdk.aws_ecs.ContainerImage.fromDockerImageAsset(image),
        environment: { AWS_ACCESS_KEY_ID: access_key.accessKeyId },
        secrets: { AWS_SECRET_KEY_ID: cdk.aws_ecs.Secret.fromSecretsManager(access_key_secret) },
        enableLogging: true,
      },
      assignPublicIp: true,
      cpu: 256,
      desiredCount: 1,
      memoryLimitMiB: 512,
    },
  )

  broadcast.service.connections.allowFromAnyIpv4(cdk.aws_ec2.Port.tcp(3000), 'app-inbound')

  return { broadcast }
}
