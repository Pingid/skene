export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DYNAMODB_TORRENTS_TABLE_NAME: string
      START_DOWNLOAD_FUNCTION_NAME: string
      DOWNLOADS_BUCKET_NAME: string
      AWS_REGION: string
    }
  }
}
