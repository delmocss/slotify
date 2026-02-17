type Props = {
  day: number
  label: string
  value: {
    enabled: boolean
    slots: { start_time: string; end_time: string }[]
  }
  onChange: (value: any) => void
}

export default function DaySchedule({
  day,
  label,
  value,
  onChange,
}: Props) {
  return (
    <div className="bg-surface border border-white/5 rounded-xl p-6 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-300">{label}</h3>

        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) =>
            onChange({ ...value, enabled: e.target.checked })
          }
        />
      </div>

      {value.enabled &&
        value.slots.map((slot, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="time"
              value={slot.start_time}
              onChange={(e) => {
                const newSlots = [...value.slots]
                newSlots[index].start_time = e.target.value
                onChange({ ...value, slots: newSlots })
              }}
              className="bg-ashSoft border border-white/10 text-white p-2 rounded-md focus:ring-2 focus:ring-copper"
            />

            <input
              type="time"
              value={slot.end_time}
              onChange={(e) => {
                const newSlots = [...value.slots]
                newSlots[index].end_time = e.target.value
                onChange({ ...value, slots: newSlots })
              }}
              className="bg-ashSoft border border-white/10 text-white p-2 rounded-md focus:ring-2 focus:ring-copper"
            />
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
          className="text-sm text-gray-300"
        >
          + Add time range
        </button>
      )}
    </div>
  )
}
