import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { AppStack, AppStackProps, Outputs } from './context'
import { Storage } from './contructs/Storage'
import { Api } from './contructs/Api'
// import { Ec2 } from './contructs/Ec2'
// import { Ecs } from './contructs/Ecs'

export class SkeneStack extends AppStack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props)

    const table = new cdk.aws_dynamodb.Table(this, this.id('TorrentsTable'), {
      partitionKey: { type: cdk.aws_dynamodb.AttributeType.STRING, name: 'pk' },
    })

    const storage = Storage(this)
    const api = Api(this, { table, storage })

    Outputs(this, {
      // Ec2PublicIp: ec2.instance.instancePublicIp,
      CloudfrontDomain: storage.distribution.domainName,
      BucketName: storage.bucket.bucketName,
      ApiEndpoint: api.apiEndpoint,
    })
  }
}
