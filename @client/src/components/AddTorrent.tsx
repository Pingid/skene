import { useForm } from 'react-hook-form'
import { trpc } from '../trpc'

export const AddTorrent = () => {
  const frm = useForm({ defaultValues: { magnet: '' } })
  const add = trpc.torrent.add.useMutation()

  return (
    <div className="form-control w-full">
      <form
        className="input-group w-full"
        onSubmit={frm.handleSubmit((x) => add.mutateAsync({ magnetURI: x.magnet }).then(() => frm.reset()))}
      >
        <input type="text" placeholder="magnet:…" className="w-full input input-bordered" {...frm.register('magnet')} />
        <button className="btn" type="submit">
          Go
        </button>
      </form>
    </div>
  )
}
