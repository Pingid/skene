import * as z from 'zod'

// -----------------------------------------------------------------
// Prize types
// -----------------------------------------------------------------
export const Id = z.string()

export const Schema = z
  .object({
    dn: z.union([z.array(z.string()), z.string()]),
    tr: z.union([z.array(z.string()), z.string()]),
    xs: z.union([z.array(z.string()), z.string()]),
    as: z.union([z.array(z.string()), z.string()]),
    ws: z.union([z.array(z.string()), z.string()]),
    kt: z.array(z.string()),
    ix: z.union([z.array(z.number()), z.number()]),
    xt: z.union([z.array(z.string()), z.string()]),
    infoHash: z.string(),
    infoHashBuffer: z.instanceof(Buffer),
    name: z.union([z.array(z.string()), z.string()]),
    keywords: z.union([z.array(z.string()), z.string()]),
    announce: z.array(z.string()),
    urlList: z.array(z.string()),
  })
  .partial()

export type Type = z.TypeOf<typeof Schema>
