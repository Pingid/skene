import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import path from 'path'

import { AppStack, AppStackProps, Outputs } from './context'
import { ClientProxy } from './contructs/ClientProxy'
import { Storage } from './contructs/Storage'
import { Client } from './contructs/Client'
import { Api } from './contructs/Api'
// import { Ec2 } from './contructs/Ec2'
// import { Ecs } from './contructs/Ecs'

export class SkeneStack extends AppStack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props)

    const table = new cdk.aws_dynamodb.Table(this, this.id('TorrentsTable'), {
      partitionKey: { type: cdk.aws_dynamodb.AttributeType.STRING, name: 'pk' },
    })

    // Downloads storage
    const storage = Storage(this)

    // Lambda api
    const api = Api(this, { table, storage })

    // Frontend
    const client = Client(this, {
      dir: path.resolve('../@client'),
      dist: 'dist',
      cmd: 'yarn build',
      certificate: this.ctx.certificate,
      domainNames: this.ctx.domainNames,
    })

    // Frontend api proxy
    ClientProxy(this, { httpApiId: api.httpApiId, distribution: client.distribution })

    Outputs(this, {
      StorageCloudfrontDomain: `https://${storage.distribution.domainName}`,
      StorageBucketName: storage.bucket.bucketName,
      ClientUrl: `https://${client.distribution.domainName}`,
      ApiUrl: api.apiEndpoint,
    })
  }
}
