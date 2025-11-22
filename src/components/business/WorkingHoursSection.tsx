'use client';

import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WorkingHours {
  [key: string]: {
    open: string;
    close: string;
    isClosed?: boolean;
  };
}

interface Props {
  workingHours?: WorkingHours | null;
}

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const dayLabels: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export default function WorkingHoursSection({ workingHours }: Props) {
  // Hooks must be called at the top level, before any early returns
  const [currentDay, setCurrentDay] = useState<string>('monday');

  useEffect(() => {
    // Calculate day on client side to avoid hydration mismatches
    const jsDayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const arrayIndex = jsDayIndex === 0 ? 6 : jsDayIndex - 1; // Map Sunday to index 6, others shift by -1
    setCurrentDay(daysOfWeek[arrayIndex]);
  }, []);

  if (!workingHours || Object.keys(workingHours).length === 0) {
    return (
      <section id="hours" className="bg-white rounded-lg shadow-sm p-6 scroll-mt-48">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Working Hours</h2>
        </div>
        <p className="text-gray-500">Working hours not available</p>
      </section>
    );
  }

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  return (
    <section id="hours" className="bg-white rounded-lg shadow-sm p-6 scroll-mt-48">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Working Hours</h2>
      </div>

      <div className="space-y-2">
        {daysOfWeek.map((day) => {
          const hours = workingHours[day];
          const isToday = day === currentDay;
          const isClosed = hours?.isClosed || !hours;

          return (
            <div
              key={day}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isToday 
                  ? 'bg-primary/5 border-l-4 border-primary' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-semibold min-w-[100px] ${
                  isToday ? 'text-primary' : 'text-gray-700'
                }`}>
                  {dayLabels[day]}
                  {isToday && (
                    <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isClosed ? (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-medium">Closed</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-900 font-medium">
                      {formatTime(hours.open)} - {formatTime(hours.close)}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          {workingHours[currentDay] && !workingHours[currentDay]?.isClosed ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Open Now</span>
              <span className="text-sm text-gray-600 ml-2">
                Closes at {formatTime(workingHours[currentDay].close)}
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-700">Closed Now</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}