import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useParams } from 'react-router-dom'

export const FilePage = () => {
  const params = useParams<{ id: string }>()
  const [p] = useSearchParams()
  const file = p.get('file')

  const isTxt = /\.txt$/.test(file || '')
  const isVideo = /\.(mkv|mp4|webm)$/gim.test(file || '')
  const url = `https://d113gahpxp3icz.cloudfront.net/downloads/${params.id}/${file}`

  const text = useQuery([file], () => fetch(url).then((x) => x.text()), { enabled: isTxt })

  return (
    <div className="">
      <p className="text-sm pb-3 px-3 font-bold">{file}</p>
      {text.data && (
        <textarea className="textarea textarea-bordered textarea-xs w-full min-h-[20rem]" value={text.data}></textarea>
      )}
      {isVideo && <video src={url} className="video-js" controls />}
    </div>
  )
}
