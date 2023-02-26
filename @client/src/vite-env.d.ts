/// <reference types="vite/client" />
declare module 'parse-torrent-name' {
  declare const parse: (title: string) => {
    episode?: number
    excess?: string
    group?: string
    season?: number
    title: string
    resolution?: string
  }

  export default parse
}
