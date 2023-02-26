import 'source-map-support/register'
import path from 'path'

import { createHttpServer } from './server'
import { createSocketServer } from './ws'
import { createContext } from './context'

const downloads_dir = process.env.DOWNLOAD_DIR || path.join(__dirname, '../../downloads')
const static_dir = path.join(__dirname, '../../@client/dist')

const run = async () => {
  const host = process.env.HOST ? process.env.HOST : process.env.IS_DOCKER ? '0.0.0.0' : undefined
  const ctx = await createContext({ downloads_dir })
  const close = createSocketServer({ port: 3001, host, createContext: () => ctx })
  await createHttpServer({ port: 3002, host, downloads_dir, ctx, static_dir })
  process.on('SIGTERM', () => {
    close()
  })
}

run()
