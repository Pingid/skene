import * as cdk from 'aws-cdk-lib'

import { AppStack } from '../context'

export const Ec2 = (stack: AppStack, props: { bucket: cdk.aws_s3.IBucket }) => {
  const vpc = cdk.aws_ec2.Vpc.fromLookup(stack, stack.id('Vpc'), { vpcName: 'default' })

  const user = new cdk.aws_iam.User(stack, stack.id('Ec2User'), { managedPolicies: [] })
  const access_key = new cdk.aws_iam.AccessKey(stack, stack.id('Ec2UserAccessKey'), { user })
  const secret = new cdk.aws_secretsmanager.Secret(stack, stack.id('Ec2UserAccessKeySecret'), {
    secretStringValue: access_key.secretAccessKey,
  })
  const role = new cdk.aws_iam.Role(stack, stack.id('Ec2Role'), {
    assumedBy: new cdk.aws_iam.ServicePrincipal('ec2.amazonaws.com'),
  })
  const policy_statement = new cdk.aws_iam.PolicyStatement({
    effect: cdk.aws_iam.Effect.ALLOW,
    resources: [props.bucket.bucketArn, props.bucket.arnForObjects('*')],
    actions: ['s3:*'],
  })
  role.addToPolicy(policy_statement)
  user.addToPolicy(policy_statement)
  secret.addToResourcePolicy(policy_statement)

  const securityGroup = new cdk.aws_ec2.SecurityGroup(stack, stack.id('Ec2SecurityGroup'), {
    vpc: vpc,
    allowAllOutbound: true,
  })

  // lets use the security group to allow inbound traffic on specific ports
  securityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(22), 'Allows SSH access from Internet')
  securityGroup.addIngressRule(cdk.aws_ec2.Peer.anyIpv4(), cdk.aws_ec2.Port.tcp(80), 'Allows HTTP access from Internet')
  securityGroup.addIngressRule(
    cdk.aws_ec2.Peer.anyIpv4(),
    cdk.aws_ec2.Port.tcp(443),
    'Allows HTTPS access from Internet',
  )

  const instance = new cdk.aws_ec2.Instance(stack, stack.id('Ec2Instance'), {
    vpc,
    role,
    securityGroup,
    instanceType: cdk.aws_ec2.InstanceType.of(cdk.aws_ec2.InstanceClass.T3, cdk.aws_ec2.InstanceSize.NANO),
    machineImage: cdk.aws_ec2.MachineImage.fromSsmParameter(
      '/aws/service/canonical/ubuntu/server/focal/stable/current/amd64/hvm/ebs-gp2/ami-id',
      { os: cdk.aws_ec2.OperatingSystemType.LINUX },
    ),
    keyName: 'skene',
  })

  // instance.addUserData(`
  //   #!/bin/bash
  //   yum update -y
  //   yum update all -y

  //   sudo yum install -y automake fuse fuse-devel gcc-c++ git libcurl-devel libxml2-devel make openssl-devel
  //   sudo yum install -y s3fs-fuse

  //   sudo yum install epel-release

  //   Docker
  //    sudo yum remove docker \
  //      docker-client \
  //      docker-client-latest \
  //      docker-common \
  //      docker-latest \
  //      docker-latest-logrotate \
  //      docker-logrotate \
  //      docker-engine

  //   sudo yum install -y yum-utils
  //   sudo yum-config-manager \
  //       --add-repo \
  //       https://download.docker.com/linux/centos/docker-ce.repo

  //   sudo yum install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  //   sudo systemctl start docker

  //   sudo su

  //   // echo "${access_key.accessKeyId}:${access_key.secretAccessKey}" > /etc/passwd-s3fs
  //   sudo chmod 640 /etc/passwd-s3fs

  //   mkdir /media
  //   s3fs ${props.bucket.bucketName} -o use_cache=/tmp -o allow_other -o uid=1001 -o mp_umask=002 -o multireq_max=5 /media

  //   amazon-linux-extras install -y nginx1
  //   systemctl start nginx
  //   systemctl enable nginx

  //   chmod 2775 /usr/share/nginx/html
  //   find /usr/share/nginx/html -type d -exec chmod 2775 {} \;
  //   find /usr/share/nginx/html -type f -exec chmod 0664 {} \;

  //   echo "<h1>It worked</h1>" > /usr/share/nginx/html/index.html
  // `)
  // ssh -i ~/.aws/pems/skene.pem ec2-user@$IP

  return { instance }
}
