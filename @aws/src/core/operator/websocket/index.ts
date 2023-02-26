import * as z from 'zod'

import * as util from '../../util'

export const handler = util.operator(z.object({ connectionId: z.string() }), async (ctx, input) => {})
