import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, createWSClient, wsLink } from '@trpc/client'
import React, { useState } from 'react'
import { trpc } from './index'

// httpBatchLink({ url: 'http://localhost:5000/trpc' }),
export const TrpcProvider = ({
  children,
  endpoint_api,
  endpoint_ws,
}: {
  children: React.ReactNode
  endpoint_api: string
  endpoint_ws: string
}) => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // wsLink({ client: createWSClient({ url: endpoint_ws }) }),
        httpBatchLink({ url: endpoint_api }),
      ],
    }),
  )
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
