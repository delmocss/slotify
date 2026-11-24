import { X } from "lucide-react"
import { useI18n } from "@/lib/i18n/useI18n"
import { WorkingHoursDay } from "@/types"

type Props = {
  day: number
  label: string
  value: WorkingHoursDay
  onChange: (value: WorkingHoursDay) => void
}

export default function DaySchedule({ day: _day, label, value, onChange }: Props) {
  const { t } = useI18n()
  return (
    <div className="space-y-3 rounded-xl border border-white/5 bg-surface p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-300">{label}</h3>

        <input
          type="checkbox"
          className="h-5 w-5 cursor-pointer accent-[#D99058]"
          aria-label={label}
          checked={value.enabled}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
        />
      </div>

      {value.enabled &&
        value.slots.map((slot, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="time"
              value={slot.start_time}
              onChange={(e) => {
                const newSlots = [...value.slots]
                newSlots[index].start_time = e.target.value
                onChange({ ...value, slots: newSlots })
              }}
              className="bg-ashSoft border border-white/10 text-white p-2 rounded-md focus:ring-2 focus:ring-copper flex-1"
            />

            <input
              type="time"
              value={slot.end_time}
              onChange={(e) => {
                const newSlots = [...value.slots]
                newSlots[index].end_time = e.target.value
                onChange({ ...value, slots: newSlots })
              }}
              className="bg-ashSoft border border-white/10 text-white p-2 rounded-md focus:ring-2 focus:ring-copper flex-1"
            />

            <button
              type="button"
              onClick={() => {
                const newSlots = value.slots.filter((_, i) => i !== index)
                onChange({ ...value, slots: newSlots })
              }}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm font-medium"
              title={t("hours.removeRange")}
              aria-label={t("hours.removeRange")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}

      {value.enabled && (
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              slots: [...value.slots, { start_time: "09:00", end_time: "17:00" }],
            })
          }
          className="py-1 text-sm text-gray-300 hover:text-white"
        >
          {t("hours.addRange")}
        </button>
      )}
    </div>
  )
}
