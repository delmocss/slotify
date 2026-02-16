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
    <div className="bg-white p-4 shadow rounded space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">{label}</h3>

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
              className="border p-2 rounded"
            />

            <input
              type="time"
              value={slot.end_time}
              onChange={(e) => {
                const newSlots = [...value.slots]
                newSlots[index].end_time = e.target.value
                onChange({ ...value, slots: newSlots })
              }}
              className="border p-2 rounded"
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
          className="text-sm text-blue-500"
        >
          + Add time range
        </button>
      )}
    </div>
  )
}
