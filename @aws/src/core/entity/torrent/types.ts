import * as z from 'zod'

// -----------------------------------------------------------------
// Prize types
// -----------------------------------------------------------------
export const SchemaFile = z.object({
  path: z.string(),
  length: z.number(),
  progress: z.number(),
  downloaded: z.number(),
})

export const Status = z.union([
  z.literal('idle'),
  z.literal('initializing'),
  z.literal('downloading'),
  z.literal('saving'),
])

export const Schema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),

  status: Status,
  name: z.string(),
  magnetURI: z.string(),
  numPeers: z.number(),
  paused: z.boolean(),
  progress: z.number(),
  downloadSpeed: z.number(),
  timeRemaining: z.number().optional(),
  files: z.array(SchemaFile),

  finnished: z.boolean(),
  running: z.boolean(),

  error: z.string().optional(),
})

export const SchemaDb = Schema.and(z.object({ pk: z.string() }))

export type Type = z.TypeOf<typeof Schema>
export type TypeDb = z.TypeOf<typeof SchemaDb>

// -----------------------------------------------------------------
// Prize types
// -----------------------------------------------------------------
export const create = (type: Pick<Type, 'id' | 'magnetURI' | 'name'>): TypeDb => {
  const now = new Date().toISOString()
  return {
    ...type,
    createdAt: now,
    updatedAt: now,
    status: 'idle',
    pk: type.id,
    numPeers: 0,
    paused: true,
    progress: 0,
    downloadSpeed: 0,
    finnished: false,
    running: false,
    files: [],
  }
}
