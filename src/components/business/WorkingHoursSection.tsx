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

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
  const [currentDay, setCurrentDay] = useState<string>('monday');
  const [isOpenNow, setIsOpenNow] = useState<boolean>(false);

  const parseTimeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hoursPart, minutesPartRaw = '0'] = time.split(':');
    let hours = parseInt(hoursPart, 10);
    const minutesDigits = minutesPartRaw.replace(/[^0-9]/g, '');
    const minutes = parseInt(minutesDigits || '0', 10);
    const periodMatch = minutesPartRaw.match(/(am|pm)/i);

    if (periodMatch) {
      const period = periodMatch[1].toLowerCase();
      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
    }

    return hours * 60 + minutes;
  };

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const jsDayIndex = now.getDay();
      const arrayIndex = jsDayIndex === 0 ? 6 : jsDayIndex - 1;
      const todayKey = daysOfWeek[arrayIndex];
      setCurrentDay(todayKey);

      if (!workingHours) {
        setIsOpenNow(false);
        return;
      }

      const todayHours = workingHours[todayKey];
      if (!todayHours || todayHours.isClosed) {
        setIsOpenNow(false);
        return;
      }

      const minutesNow = now.getHours() * 60 + now.getMinutes();
      const openMinutes = parseTimeToMinutes(todayHours.open);
      const closeMinutes = parseTimeToMinutes(todayHours.close);

      let openNow = false;
      if (closeMinutes === openMinutes) {
        openNow = false;
      } else if (closeMinutes > openMinutes) {
        openNow = minutesNow >= openMinutes && minutesNow < closeMinutes;
      } else {
        // Handles schedules that pass midnight (e.g., 22:00 - 02:00)
        openNow = minutesNow >= openMinutes || minutesNow < closeMinutes;
      }

      setIsOpenNow(openNow);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, [workingHours]);

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
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      isOpenNow 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {isOpenNow ? 'Open Now' : 'Closed Now'}
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
    </section>
  );
}