import { TorrentClient, createTorrentClient, TypedEventEmitter } from '../services'
import * as entity from '../entities'
export interface AppEvents {
  'torrent:error': [string]
  'torrent:add': [entity.Torrent]
  'torrent:update': [Partial<entity.Torrent> & { magnet: string }]
}

export interface Context {
  downloads_dir: string
  ee: TypedEventEmitter<AppEvents>
  torrent: TorrentClient
}

export const createContext = async ({ downloads_dir }: { downloads_dir: string }): Promise<Context> => {
  const ee = new TypedEventEmitter<AppEvents>()
  const torrent = await createTorrentClient({ downloads_dir })
  return { downloads_dir, torrent, ee }
}
