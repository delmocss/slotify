import { useEffect, useId, useRef, useState } from "react"
import { DayPicker } from "react-day-picker"
import { enGB, es as esLocale } from "react-day-picker/locale"
import { useI18n } from "@/lib/i18n/useI18n"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"

type Props = {
  /** Selected date as YYYY-MM-DD, or "" when empty. */
  value: string
  onChange: (value: string) => void
  /** Earliest selectable date (YYYY-MM-DD). */
  min?: string
  /** Latest selectable date (YYYY-MM-DD). */
  max?: string
  placeholder?: string
  /** Shows a clear button when a date is selected. */
  clearable?: boolean
  className?: string
  "aria-label"?: string
}

// Dates travel as plain YYYY-MM-DD strings. Parse and format them in local time:
// going through Date.toISOString() shifts the day for users west of UTC.
function parse(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function format(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder,
  clearable = false,
  className = "",
  "aria-label": ariaLabel,
}: Props) {
  const { t, lang, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const display = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const selected = parse(value)
  const minDate = min ? parse(min) : undefined
  const maxDate = max ? parse(max) : undefined

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const disabled = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ]

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          // Open towards the side with room so the calendar never spills off-screen.
          const rect = rootRef.current?.getBoundingClientRect()
          if (rect) {
            const PANEL_WIDTH = 340
            setAlignRight(
              rect.left + PANEL_WIDTH > window.innerWidth - 8 && rect.right - PANEL_WIDTH >= 8
            )
          }
          setOpen((o) => !o)
        }}
        className={`flex w-full items-center gap-2 rounded-md border bg-ashSoft px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-copper ${
          open ? "border-copper/60" : "border-white/10 hover:border-white/25"
        }`}
      >
        <Calendar className="h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
        <span className={`flex-1 truncate ${selected ? "text-white" : "text-gray-400"}`}>
          {selected ? display.format(selected) : (placeholder ?? t("datepicker.placeholder"))}
        </span>
        {clearable && selected && (
          <span
            role="button"
            tabIndex={0}
            aria-label={t("datepicker.clear")}
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                e.stopPropagation()
                onChange("")
              }
            }}
            className="rounded p-0.5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t("datepicker.dialog")}
          className={`absolute top-full z-50 mt-2 max-w-[calc(100vw-1.5rem)] overflow-x-auto rounded-2xl ${alignRight ? "right-0" : "left-0"} border border-white/10 bg-[#1f201c] p-3 shadow-2xl shadow-black/50`}
        >
          <DayPicker
            mode="single"
            className="slotify-calendar"
            selected={selected}
            defaultMonth={selected ?? minDate}
            onSelect={(date) => {
              if (!date) return
              onChange(format(date))
              setOpen(false)
            }}
            disabled={disabled}
            weekStartsOn={1}
            locale={lang === "es" ? esLocale : enGB}
            showOutsideDays
            autoFocus
            components={{
              Chevron: ({ orientation, className }) =>
                orientation === "left" ? (
                  <ChevronLeft className={className} width={18} height={18} />
                ) : (
                  <ChevronRight className={className} width={18} height={18} />
                ),
            }}
          />
        </div>
      )}
    </div>
  )
}
