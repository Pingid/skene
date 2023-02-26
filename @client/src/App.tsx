import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { FileBreadCrumb, FileCrumb, TorrentsLinkCrumb } from './components/FileBreadCrumb'
import { TorrentList } from './components/TorrentList'
import { AddTorrent } from './components/AddTorrent'
import { Layout } from './components/Layout'

import { TrpcProvider } from './trpc/Provider'
import { FilePage } from './components/FilePage'
import { SearchProvider, SearchResults, SearchTorrents } from './components/SearchTorrents'

export const App = () => {
  return (
    <TrpcProvider endpoint_ws={process.env.ENDPOINT_WS || 'ws://localhost:3001'} endpoint_api="/api/trpc">
      <RouterProvider router={router} />
    </TrpcProvider>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    index: true,
    element: (
      <SearchProvider>
        <Layout
          title="Torrents"
          nav={[]}
          header={<SearchTorrents />}
          breadcrumb={<FileBreadCrumb>{null}</FileBreadCrumb>}
        >
          <div className="p-6">
            <SearchResults />
            <TorrentList />
          </div>
        </Layout>
      </SearchProvider>
    ),
  },
  {
    path: '/:id/file',
    element: (
      <Layout
        title="File"
        nav={[]}
        breadcrumb={
          <FileBreadCrumb>
            <TorrentsLinkCrumb />
            <FileCrumb />
          </FileBreadCrumb>
        }
      >
        <div className="p-6">
          <FilePage />
        </div>
      </Layout>
    ),
  },
])
