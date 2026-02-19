import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import Skeleton from "@/components/ui/Skeleton"
import { Booking } from "@/types"

type Props = {
  bookings: Booking[]
}

export default function BookingsChart({ bookings }: Props) {
  // Agrupar últimos 7 días
  const today = new Date()

  const data = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date()
    date.setDate(today.getDate() - (6 - index))

    const dateString = date.toISOString().split("T")[0]

    const count = bookings.filter(
      (b) => b.date === dateString && b.status === "confirmed"
    ).length

    return {
      date: new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bookings: count,
    }
  })

  const totalBookings = data.reduce((sum, day) => sum + day.bookings, 0)
  const avgBookings = totalBookings / 7
  const maxBookings = Math.max(...data.map(d => d.bookings))
  const minBookings = Math.min(...data.map(d => d.bookings))
  
  // Calcular tendencia (últimos 3 días vs primeros 3 días)
  const recentAvg = data.slice(-3).reduce((sum, day) => sum + day.bookings, 0) / 3
  const earlierAvg = data.slice(0, 3).reduce((sum, day) => sum + day.bookings, 0) / 3
  const trendPercentage = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg * 100).toFixed(1) : 0
  const isPositiveTrend = Number(trendPercentage) >= 0

  if (!data || data.length === 0) {
    return (
      <Skeleton className="h-[400px] w-full rounded-3xl" />
    )
  }

  return (
    <div className="relative bg-gradient-to-br from-[#2A2B27] via-[#252621] to-[#1f201c] border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-copper/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-copper/5 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
          {/* Main Metric */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-copper to-copper/50 rounded-full" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                Booking Activity
              </p>
            </div>
            
            <div className="flex items-end gap-4">
              <div>
                <h3 className="text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 tracking-tight leading-none">
                  {totalBookings}
                </h3>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  Total bookings last 7 days
                </p>
              </div>
              
              {/* Trend Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                isPositiveTrend 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                <span className="text-base">{isPositiveTrend ? '↗' : '↘'}</span>
                <span>{Math.abs(Number(trendPercentage))}%</span>
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-copper/10 mb-2">
                <span className="text-copper text-lg">📊</span>
              </div>
              <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Average</p>
              <p className="text-2xl font-bold text-white">{avgBookings.toFixed(1)}</p>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10 mb-2">
                <span className="text-green-400 text-lg">📈</span>
              </div>
              <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Peak</p>
              <p className="text-2xl font-bold text-green-400">{maxBookings}</p>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 mb-2">
                <span className="text-blue-400 text-lg">📉</span>
              </div>
              <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Lowest</p>
              <p className="text-2xl font-bold text-blue-400">{minBookings}</p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 10 }}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C87D4D" stopOpacity={0.5}/>
                  <stop offset="40%" stopColor="#C87D4D" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#C87D4D" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C87D4D" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#C87D4D" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#C87D4D" stopOpacity={0.8}/>
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#C87D4D" floodOpacity="0.4"/>
                </filter>
              </defs>
              
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 600 }}
                dy={15}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }}
                allowDecimals={false}
                width={45}
              />
              
              <ReferenceLine 
                y={avgBookings} 
                stroke="#6B7280" 
                strokeDasharray="3 3" 
                strokeOpacity={0.3}
                label={{ 
                  value: 'Avg', 
                  position: 'right', 
                  fill: '#6B7280', 
                  fontSize: 11,
                  fontWeight: 600
                }}
              />
              
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1a1b17]/95 backdrop-blur-xl border border-copper/30 rounded-2xl px-5 py-4 shadow-2xl">
                        <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
                          {payload[0].payload.fullDate}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-black text-white">
                            {payload[0].value}
                          </p>
                          <span className="text-sm font-medium text-gray-400">bookings</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
                cursor={{ 
                  stroke: '#C87D4D', 
                  strokeWidth: 2, 
                  strokeDasharray: '5 5',
                  opacity: 0.4
                }}
              />
              
              <Area 
                type="monotone" 
                dataKey="bookings" 
                stroke="url(#strokeGradient)" 
                strokeWidth={3.5}
                fill="url(#colorBookings)"
                dot={{ 
                  fill: '#C87D4D', 
                  strokeWidth: 3, 
                  r: 5,
                  stroke: '#1a1b17',
                  filter: 'url(#shadow)'
                }}
                activeDot={{ 
                  r: 8, 
                  fill: '#C87D4D', 
                  stroke: '#fff', 
                  strokeWidth: 3,
                  filter: 'url(#shadow)',
                  style: { cursor: 'pointer' }
                }}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
