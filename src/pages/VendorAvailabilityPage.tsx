import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Circle } from 'lucide-react';
import Calendar from 'react-calendar';
import { supabase } from '../services/supabase';

interface AvailabilitySlot {
  id: string;
  vendor_id: string;
  date: string; // YYYY-MM-DD format
  status: 'available' | 'unavailable' | 'booked' | 'not set';
}

const statusColors: Record<AvailabilitySlot['status'], string> = {
  available: 'bg-green-400',
  unavailable: 'bg-red-400',
  booked: 'bg-purple-400',
  'not set': 'bg-gray-400',
};

const VendorAvailabilityPage: React.FC = () => {
  const { vendorId } = useParams();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('vendor_id', vendorId);

      console.log("Fetched availability data:", data);

      if (error) {
        console.error('Error fetching availability:', error);
        return;
      }

      setSlots(data || []);
      setLoading(false);
    };

    fetchAvailability();
  }, [vendorId]);

  // Convert slots into a map keyed by date for quicker lookup
  const availabilityByDate: Record<string, AvailabilitySlot['status']> = {};

  slots.forEach(slot => {
    const dateStr = slot.date;
    availabilityByDate[dateStr] = slot.status || 'not set';
  });

  // Generate days for current month for calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // --- Calendar Navigation ---
  const prevMonth = () => {
      setCurrentDate(prev => subMonths(prev, 1));
      setSelectedDate(null);
  };

  const nextMonth = () => {
        setCurrentDate(prev => addMonths(prev, 1));
        setSelectedDate(null);
  };


  // Helper to get a date's availability status from fetched data
    const getDateStatus = (date: Date): 'available' | 'unavailable' | 'not set' => {
        const dateString = format(date, 'yyyy-MM-dd');
        return availabilityByDate[dateString] || 'not set';
    };

  
    // Helper to find booking for a specific date from fetched data
      const getBookingForDate = (date: Date) => {
        //   const dateString = format(date, 'yyyy-MM-dd');
        //   return bookingsData.find(booking => booking.event_date === dateString);
        return false;
      };


  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold"> Availability</h1>
     </div>

      {loading ? (
        <p>Loading availability...</p>
      ) : (
        <>

           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Calendar Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <CalendarIcon size={20} className="text-purple-600 dark:text-purple-400 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {format(currentDate, 'MMMM yyyy')}
                        </h3>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={prevMonth}
                            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            aria-label="Previous month"
                        >
                            <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            aria-label="Next month"
                        >
                            <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>
                </div>


                <div className="p-4">
                  {/* Days of week */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                          <div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                              {day}
                          </div>
                      ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-2">
                      {/* Render empty cells for days before the 1st of the month */}
                      {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-14"></div>
                      ))}

                      {days.map((day, i) => {
                          const dateStatus = getDateStatus(day);
                          const hasBooking = getBookingForDate(day);
                        //   const isSelected = selectedDate && isSameDay(day, selectedDate);
                          const isToday = isSameDay(day, new Date());

                          let bgClass = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white';

                          if (dateStatus === 'available') {
                              bgClass = 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30';
                          } else if (dateStatus === 'unavailable') {
                              bgClass = 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30';
                          }

                          if (hasBooking) {
                              bgClass = 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/30';
                          }

                          if (isToday) {
                              bgClass += ' border-2 border-orange-400 dark:border-orange-600';
                          }

                        //   if (isSelected) {
                        //       bgClass += ' ring-2 ring-purple-600 dark:ring-purple-400';
                        //   }

                          return (
                              <div
                                key={i}
                                className={`rounded-lg p-1 h-14 flex flex-col items-center justify-center transition ${bgClass}`}>
                                  <span className="text-sm font-medium">{format(day, 'd')}</span>
                                  {hasBooking && (
                                      <div className="w-4 h-1 mt-1 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                                  )}
                                </div>
                          );
                      })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-6 text-sm">
                      <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 mr-1"></div>
                          <span className="text-gray-700 dark:text-gray-300">Not Set</span>
                      </div>
                      <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                          <span className="text-gray-700 dark:text-gray-300">Available</span>
                      </div>
                      <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                          <span className="text-gray-700 dark:text-gray-300">Unavailable</span>
                      </div>
                      <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                          <span className="text-gray-700 dark:text-gray-300">Booked</span>
                      </div>
                  </div>
                </div>



              </div>


            {/* <Calendar
                tileClassName={({ date, view }) => {
                    if (view !== 'month') return;

                    const dateStr = date.toISOString().split('T')[0];
                    const status = availabilityByDate[dateStr];
                    return statusColors[status || 'not set'];
                }}
            /> */}
          {/* <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Legend:</h2>
            <ul className="flex flex-wrap gap-4">
            <li className="flex items-center gap-2">
                <Circle className="text-green-400" fill="currentColor" /> Available
            </li>
            <li className="flex items-center gap-2">
                <Circle className="text-red-400" fill="currentColor" /> Unavailable
            </li>
            <li className="flex items-center gap-2">
                <Circle className="text-purple-400" fill="currentColor" /> Booked
            </li>
            <li className="flex items-center gap-2">
                <Circle className="text-gray-400" fill="currentColor" /> Not Set
            </li>
            </ul>
          </div> */}
        </>
      )}
    </div>
  );
};

export default VendorAvailabilityPage;
