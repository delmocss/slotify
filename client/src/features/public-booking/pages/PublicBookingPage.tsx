export default function PublicBookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Book an Appointment</h1>
        <p className="text-gray-600 text-center mb-8">Select a service and available time slot</p>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Service</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Choose a service...</option>
              <option>Haircut - 30 min</option>
              <option>Hair Color - 60 min</option>
              <option>Massage - 45 min</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Time</label>
            <div className="grid grid-cols-4 gap-2">
              {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => (
                <button
                  key={time}
                  className="py-2 px-3 border border-gray-300 rounded-md hover:bg-blue-50 transition"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Your Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          
          <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition font-medium">
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  )
}