interface Props {
  className?: string
}

export default function Skeleton({ className }: Props) {
  return (
    <div
      className={`animate-pulse bg-white/10 rounded-lg ${className}`}
    />
  )
}
