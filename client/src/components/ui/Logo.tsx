type Props = {
  className?: string
}

/** Slotify mark: a calendar page with two booked time slots. */
export default function Logo({ className = "h-5 w-5" }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="4.5" width="17" height="16" rx="3.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 2.75v3.5M16 2.75v3.5" />
      <rect x="7" y="12.5" width="6" height="2.25" rx="1.1" fill="currentColor" stroke="none" />
      <rect x="7" y="16" width="9.5" height="2.25" rx="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
