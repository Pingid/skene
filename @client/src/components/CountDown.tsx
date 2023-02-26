export const CountDown = ({ remaining }: { remaining: number }) => {
  const seconds = Math.floor(remaining / 1000)
  const minutes = Math.floor(remaining / 1000 / 60)
  const hours = Math.floor(remaining / 1000 / 60 / 60)
  return (
    <span className="countdown font-mono text-2xl">
      <span style={{ '--value': hours } as any}></span>:<span style={{ '--value': minutes } as any}></span>:
      <span style={{ '--value': seconds } as any}></span>
    </span>
  )
}
