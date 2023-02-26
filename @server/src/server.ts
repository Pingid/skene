import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import FastifyStatic from '@fastify/static'
import FastifyCors from '@fastify/cors'
import Fasitfy from 'fastify'
import path from 'path'
import fs from 'fs'
import z from 'zod'

import { appRouter } from './trpc/router'
import { Context } from './context'

export const createHttpServer = async ({
  port,
  host,
  downloads_dir,
  static_dir,
  ctx,
}: {
  port: number
  host?: string
  downloads_dir: string
  static_dir: string
  ctx: Context
}) => {
  const fastify = Fasitfy({ logger: true })

  await fastify.register(FastifyCors, { origin: ['*'] })

  fastify.register((instance, _opts, next) => {
    instance.register(FastifyStatic, { root: static_dir, prefix: '/' })
    fastify.setNotFoundHandler(function (request, reply) {
      ;(reply as any).sendFile('index.html')
    })
    next()
  })

  fastify.register((instance, _opts, next) => {
    instance.register(FastifyStatic, { root: downloads_dir, prefix: '/downloads' })
    next()
  })

  // Declare a route
  fastify.get('/api/file', async (request, reply) => {
    const q = z.object({ file: z.string(), format: z.literal('mp4').optional(), id: z.string() }).parse(request.query)
    const p = path.parse(q.file)

    const source = path.join(downloads_dir, q.id, q.file)
    // const target = path.join(downloads_dir, q.id, `${p.name}${q.format ? `.${q.format}` : p.ext}`)
    const stream = fs.createReadStream(source)
    reply.header('Accept-Ranges', 'none')
    reply.type('video/mp4')
    reply.send(stream)
  })

  fastify.register(fastifyTRPCPlugin, {
    prefix: '/api/trpc',
    trpcOptions: { router: appRouter, createContext: () => ctx },
  })

  await fastify.listen({ port, host })
}
