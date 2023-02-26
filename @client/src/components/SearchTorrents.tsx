import { createContext, useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'

dayjs.extend(relativeTime)

import { trpc } from '../trpc'
import { cn } from '../utils'
import { useMutation } from '@tanstack/react-query'

type Query = { query: string }
const QueryContext = createContext<[Query, React.Dispatch<React.SetStateAction<Query>>]>([{ query: '' }, () => {}])
export const SearchProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryContext.Provider value={useState({ query: '' })}>{children}</QueryContext.Provider>
)

export const SearchTorrents = () => {
  const frm = useForm({ defaultValues: { query: '' } })
  const [q, setQuery] = useContext(QueryContext)
  const add = trpc.torrent.add.useMutation()
  const ctx = trpc.useContext()

  const isMagnet = /^magnet:/gim.test(frm.watch('query'))

  return (
    <div className="form-control w-full">
      <form
        className="input-group w-full"
        onSubmit={frm.handleSubmit((x) => {
          if (!isMagnet) return setQuery(x)
          setQuery({ ...q, query: '' })
          frm.reset()
          add.mutateAsync({ magnetURI: x.query }).then(() => ctx.torrent.list.refetch())
        })}
      >
        <input type="text" placeholder="Search…" className="w-full input input-bordered" {...frm.register('query')} />
        <button className={cn('btn', [add.isLoading, 'loading'])} type="submit">
          {isMagnet ? 'Add' : 'Search'}
        </button>
      </form>
    </div>
  )
}

export const SearchResults = () => {
  const [q, setQuery] = useContext(QueryContext)
  const ctx = trpc.useContext()
  const cliboard = useMutation((text: string) => navigator?.clipboard?.writeText(text))
  const enabled = q.query.length > 0
  const torrents = trpc.torrent.search.useQuery(
    { ...q, providers: ['Yts', 'ThePirateBay'], limit: 50, category: 'all' },
    { enabled },
  )
  const add = trpc.torrent.add.useMutation()

  return (
    <div className="space-y-3">
      <button className={cn('btn loading btn-ghost w-full mb-6', [enabled && torrents.isLoading, '', 'hidden'])}>
        loading
      </button>
      {torrents.data?.map((x) => (
        <article className="rounded-lg border border-gray-100" key={x.magnet}>
          <div className="flex flex-wrap pt-5 pr-5">
            <h3 className="text-lg font-medium w-full pt-5 pl-5 min-w-24 flex-[1_1_16rem]">{x.title}</h3>
            <div className="stats flex-[1_1_16rem] shadow">
              <div className="stat w-full">
                <div className="stat-title w-full truncate">{dayjs(x.time).fromNow()}</div>
                <div className="stat-des">{x.provider}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Seeds</div>
                <div className="stat-des">{x.seeds}</div>
              </div>
            </div>
            <div className="stats flex-[1_1_16rem] shadow">
              <div className="stat">
                <div className="stat-title">Peers</div>
                <div className="stat-des text-secondary">{x.peers}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Size</div>
                <div className="stat-des">{x.size}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end p-5">
            <div className="btn-group">
              <button className={cn('btn btn-sm')} onClick={() => cliboard.mutate(x.magnet || '')}>
                magnet
              </button>
              <button
                className="btn btn-sm btn-active"
                onClick={() => {
                  setQuery({ ...q, query: '' })
                  if (!x.magnet) return
                  ctx.torrent.list.invalidate()
                  add.mutateAsync({ magnetURI: x.magnet }).then(() => ctx.torrent.list.refetch())
                }}
              >
                Add
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
