import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { Link } from 'react-router-dom'

import { CountDown } from './CountDown'
import { trpc } from '../trpc'
import { cn } from '../utils'

export const TorrentList = () => {
  const torrents = trpc.torrent.list.useQuery({})

  return (
    <div className="space-y-3">
      {torrents.isLoading && <progress className="progress w-full py-3">loading</progress>}
      {torrents.data?.items?.map((x) => (
        <Torrent key={x.magnetURI} id={x.id} />
      ))}
    </div>
  )
}

const Torrent = ({ id }: { id: string }) => {
  const client = useQueryClient()
  const data = trpc.torrent.get.useQuery(
    { id },
    { refetchInterval: (x) => (x?.running && x?.status !== 'idle' ? 1000 : false) },
  )
  const start = trpc.torrent.start.useMutation({ onSettled: () => data.refetch() })
  const stop = trpc.torrent.stop.useMutation({ onSettled: () => data.refetch() })

  const key = getQueryKey(trpc.torrent.get, { id }, 'query')

  if (!data.data) return null

  const running = !!data.data?.running
  const finnished = !!data.data?.finnished

  return (
    <article className="rounded-lg border border-gray-100 bg-white p-4">
      <p className="badge badge-xs badge-ghost">{data.data.id}</p>
      <div className="flex justify-between">
        <p className="pb-2">{data.data.name}</p>
        <div
          className={cn('badge', [finnished && data.data.status === 'idle', 'hidden'], {
            'badge-info': data.data.status === 'idle',
            'badge-warning': data.data.status === 'initializing',
            'badge-outline loading': data.data.status === 'downloading',
            'badge-secondary': data.data.status === 'saving',
          })}
        >
          {data.data.status}
        </div>
      </div>
      <div className={cn('flex gap-3 items-baseline', [finnished && data.data.status === 'idle', 'hidden'])}>
        <div className="flex items-center gap-2 w-full"></div>
        {data.data.timeRemaining && <CountDown remaining={data.data.timeRemaining} />}
      </div>

      <div className="">
        {data.data?.files.map((x) => {
          const progress = ((x.downloaded / x.length) * 100).toFixed(2)
          return (
            <div key={x.path} className="flex justify-between gap-3 items-baseline">
              <div className="overflow-x-hidden">
                <Link to={`/${data.data?.id}/file?file=${x.path}`} className="text-sm link truncate">
                  {x.path}
                </Link>
              </div>
              <progress
                className={cn(
                  'progress flex-[1_1_10rem]',
                  [!!data.data?.running, 'progress-success', 'progress-warning'],
                  [finnished && !data.data?.running, 'hidden'],
                )}
                value={progress}
                max="100"
              ></progress>
              <p className={cn('text-xs', [finnished && !data.data?.running, 'hidden'])}>{progress}%</p>
            </div>
          )
        })}
      </div>

      <div className={cn('flex justify-end', [finnished && data.data.status === 'idle', 'hidden'])}>
        <input
          type="checkbox"
          className={cn('toggle', [data.data.running, 'toggle-success', ''])}
          checked={running}
          onChange={() => {
            if (!data.data?.id) return
            if (running) {
              stop.mutate({ id: data.data?.id })
              client.setQueryData(key, { ...data.data, running: false })
            } else {
              start.mutate({ id: data.data.id })
              client.setQueryData(key, { ...data.data, running: true })
            }
          }}
        />
      </div>
    </article>
  )
}
