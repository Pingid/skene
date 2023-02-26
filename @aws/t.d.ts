export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_REGION: string
      AWS_ACCOUNT: string

      ROUTE53_DOMAIN?: string

      DYNAMODB_TORRENTS_TABLE_NAME: string
      START_DOWNLOAD_FUNCTION_NAME: string
      DOWNLOADS_BUCKET_NAME: string
    }
  }
}
