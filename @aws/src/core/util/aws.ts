import { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import * as z from 'zod'

export const operator = <C, I, R>(input: z.ZodType<I>, fn: (ctx: C, input: I) => Promise<R>) =>
  Object.assign(fn, { input, output: undefined as undefined | z.ZodType<R> })

/**
 * @dev Takes an operator function with an aws gatway event transformer
 * @param operator An async function that accepts some context and input
 * @param props {
 *  ctx: Some context often shared by many operators
 *  input: (event: APIGatewayProxyEvent) => (operator input)
 * }
 */
export const bind_apigatway =
  <C, A, R>(
    operator: (ctx: C, input: A) => Promise<R>,
    props: {
      ctx: C | (() => C)
      input: (event: APIGatewayProxyEventV2WithLambdaAuthorizer<{ wallet_address: string }>) => A
    },
  ) =>
  (event: APIGatewayProxyEventV2WithLambdaAuthorizer<{ wallet_address: string }>) =>
    Promise.resolve()
      .then(() => ({
        input: props.input(event),
        ctx: typeof props.ctx === 'function' ? (props.ctx as any)() : props.ctx,
      }))
      .then(({ input, ctx }) => {
        console.log(`input:`, input)
        return operator(ctx, input)
      })
      .then((body) => {
        const result = z.object({ statusCode: z.number(), body: z.string().optional() }).safeParse(body)
        if (result.success) return body
        return respond.success(body)
      })
      .catch(handleError)

const handleError = (x: any) => {
  if (x instanceof z.ZodError) return respond.bad({ error: { name: 'ValidationError', issues: x.issues } })
  return respond.error(x)
}

/**
 * @dev utility to create aws api gateway response type.
 * @param reward new reward attributes
 */
export const respond = (res: APIGatewayProxyStructuredResultV2) => ({
  headers: {
    'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
  },
  ...res,
})
respond.with = (code: number, data: any) =>
  respond({ statusCode: code, body: typeof data !== 'string' ? JSON.stringify(data) : data })
respond.success = (data: any) => respond.with(200, data)
respond.error = (data: any) => respond.with(500, data)
respond.bad = (data: any) => respond.with(400, data)

export const parseBody = <T extends { body?: any }>(x: T) => {
  try {
    return JSON.parse(x.body)
  } catch (e) {
    throw new Error(`Failed to parse body`)
  }
}
