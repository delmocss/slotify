import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getWorkingHours, updateWorkingHours } from "../api/workingHours.api"
import DaySchedule from "../components/DaySchedule"
import { useState, useEffect } from "react"

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

export default function WorkingHoursPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["working-hours"],
    queryFn: getWorkingHours,
  })

  const mutation = useMutation({
    mutationFn: updateWorkingHours,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours"] })
    },
  })

  const [schedule, setSchedule] = useState<any>({})

  useEffect(() => {
    if (!data) return

    const grouped: any = {}

    for (let i = 0; i < 7; i++) {
      grouped[i] = { enabled: false, slots: [] }
    }

    data.forEach((item: any) => {
      grouped[item.day_of_week].enabled = true
      grouped[item.day_of_week].slots.push({
        start_time: item.start_time,
        end_time: item.end_time,
      })
    })

    setSchedule(grouped)
  }, [data])

  if (isLoading) return <div>Loading...</div>

  const handleSave = () => {
    const formatted: any[] = []

    Object.keys(schedule).forEach((day) => {
      if (!schedule[day].enabled) return

      schedule[day].slots.forEach((slot: any) => {
        formatted.push({
          day_of_week: Number(day),
          start_time: slot.start_time,
          end_time: slot.end_time,
        })
      })
    })

    mutation.mutate(formatted)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Working Hours</h2>

      <div className="grid gap-4">
        {days.map((label, index) => (
          <DaySchedule
            key={index}
            day={index}
            label={label}
            value={schedule[index] || { enabled: false, slots: [] }}
            onChange={(val) =>
              setSchedule({ ...schedule, [index]: val })
            }
          />
        ))}
      </div>

      <button
        onClick={handleSave}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Save
      </button>
    </div>
  )
}
