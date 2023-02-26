import { applyWSSHandler } from '@trpc/server/adapters/ws'
import ws from 'ws'

import { appRouter } from './trpc/router'
import { Context } from './context'

export const createSocketServer = ({
  createContext,
  host,
  port,
}: {
  port: number
  host?: string
  createContext: () => Context
}) => {
  const wss = new ws.Server({ port: 3001, host })

  const handler = applyWSSHandler({ wss, router: appRouter, createContext })

  wss.on('connection', (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`)
    ws.once('close', () => {
      console.log(`➖➖ Connection (${wss.clients.size})`)
    })
  })
  console.log('✅ WebSocket Server listening on ws://localhost:3001')

  return () => {
    handler.broadcastReconnectNotification()
    wss.close()
  }
}
