import { useFormikContext } from 'formik';
import { Clock } from 'lucide-react';
import { useState } from 'react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function WorkingHoursSection() {
  const { values, setFieldValue } = useFormikContext<any>();
  const [activePicker, setActivePicker] = useState<{ day: string; type: 'open' | 'close' } | null>(null);

  const handleTimeChange = (day: string, field: 'open' | 'close', hour: number, minute: number) => {
    const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    setFieldValue(`workingHours.${day}.${field}`, formattedTime);
    setActivePicker(null);
  };

  const toggleClosed = (day: string) => {
    const isClosed = values.workingHours?.[day]?.isClosed || false;
    setFieldValue(`workingHours.${day}.isClosed`, !isClosed);
  };

  const parseTime = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return { hour: 9, minute: 0 };
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour: hour || 9, minute: minute || 0 };
  };

  const TimePickerDropdown = ({ day, type }: { day: string; type: 'open' | 'close' }) => {
    const timeStr = values.workingHours?.[day]?.[type] || '09:00';
    const { hour: currentHour, minute: currentMinute } = parseTime(timeStr);

    return (
      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-3">
        <div className="flex gap-4">
          {/* Hours */}
          <div className="max-h-48 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-500 mb-2 text-center">Hours</div>
            {Array.from({ length: 24 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleTimeChange(day, type, i, currentMinute)}
                className={`block w-full px-4 py-2 text-sm rounded hover:bg-gray-100 ${
                  currentHour === i ? 'bg-primary text-white hover:bg-primary/90' : ''
                }`}
              >
                {String(i).padStart(2, '0')}
              </button>
            ))}
          </div>

          {/* Minutes */}
          <div className="max-h-48 overflow-y-auto border-l border-gray-200 pl-2">
            <div className="text-xs font-semibold text-gray-500 mb-2 text-center">Minutes</div>
            {Array.from({ length: 60 }, (_, i) => i).map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => handleTimeChange(day, type, currentHour, min)}
                className={`block w-full px-4 py-2 text-sm rounded hover:bg-gray-100 ${
                  currentMinute === min ? 'bg-primary text-white hover:bg-primary/90' : ''
                }`}
              >
                {String(min).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Clock className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Working Hours</h2>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => {
          const dayData = values.workingHours?.[day] || { open: '09:00', close: '18:00', isClosed: false };
          
          return (
            <div key={day} className="flex items-center gap-4">
              <div className="w-32">
                <span className="text-sm font-medium text-gray-900 capitalize">{day}</span>
              </div>

              {!dayData.isClosed ? (
                <>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setActivePicker(activePicker?.day === day && activePicker.type === 'open' ? null : { day, type: 'open' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent text-left cursor-pointer"
                    >
                      {dayData.open || '09:00'}
                    </button>
                    {activePicker?.day === day && activePicker.type === 'open' && (
                      <TimePickerDropdown day={day} type="open" />
                    )}
                  </div>

                  <span className="text-gray-500">to</span>

                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setActivePicker(activePicker?.day === day && activePicker.type === 'close' ? null : { day, type: 'close' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent text-left cursor-pointer"
                    >
                      {dayData.close || '18:00'}
                    </button>
                    {activePicker?.day === day && activePicker.type === 'close' && (
                      <TimePickerDropdown day={day} type="close" />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-gray-500 text-center">
                  Closed
                </div>
              )}

              <button
                type="button"
                onClick={() => toggleClosed(day)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dayData.isClosed
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dayData.isClosed ? 'Open' : 'Closed'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}