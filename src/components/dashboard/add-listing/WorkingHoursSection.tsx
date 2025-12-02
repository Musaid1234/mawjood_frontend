import { useFormikContext } from 'formik';
import { Clock, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type Day = (typeof DAYS)[number];

type WorkingDay = {
  open: string;
  close: string;
  isClosed: boolean;
};

const DEFAULT_DAY: WorkingDay = {
  open: '09:00',
  close: '18:00',
  isClosed: false,
};

export default function WorkingHoursSection() {
  const { values, setFieldValue } = useFormikContext<any>();
  const [activePicker, setActivePicker] = useState<{ day: Day; type: 'open' | 'close' } | null>(null);

  const getDayData = (day: Day): WorkingDay => ({
    ...DEFAULT_DAY,
    ...(values.workingHours?.[day] ?? {}),
  });

  const handleTimeChange = (
    day: Day,
    field: 'open' | 'close',
    hour: number,
    minute: number,
    opts?: { close?: boolean }
  ) => {
    const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    setFieldValue(`workingHours.${day}.${field}`, formattedTime);
    if (opts?.close) {
      setActivePicker(null);
    }
  };

  const toggleClosed = (day: Day) => {
    const isClosed = Boolean(values.workingHours?.[day]?.isClosed);
    setFieldValue(`workingHours.${day}.isClosed`, !isClosed);
  };

  const parseTime = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return { hour: 9, minute: 0 };
    const [hour, minute] = timeStr.split(':').map(Number);
    return {
      hour: Number.isFinite(hour) ? (hour as number) : 9,
      minute: Number.isFinite(minute) ? (minute as number) : 0,
    };
  };

  const TimePickerDropdown = ({ day, type }: { day: Day; type: 'open' | 'close' }) => {
    const timeStr = getDayData(day)[type] || DEFAULT_DAY[type];
    const { hour: currentHour, minute: currentMinute } = parseTime(timeStr);

    return (
      <div className="absolute left-0 top-full z-50 mt-1 w-max max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-3 shadow-2xl sm:left-auto sm:right-0">
        <div className="flex gap-4">
          <div className="w-16 max-h-48 overflow-y-auto">
            <div className="mb-2 text-center text-xs font-semibold text-gray-500">Hours</div>
            {Array.from({ length: 24 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleTimeChange(day, type, i, currentMinute)}
                className={`block w-full rounded-md px-2 py-2 text-sm transition-colors ${
                  currentHour === i ? 'bg-primary text-white hover:bg-primary/90' : 'hover:bg-gray-100'
                }`}
              >
                {String(i).padStart(2, '0')}
              </button>
            ))}
          </div>

          <div className="w-16 max-h-48 overflow-y-auto border-l border-gray-200 pl-3">
            <div className="mb-2 text-center text-xs font-semibold text-gray-500">Minutes</div>
            {Array.from({ length: 60 }, (_, i) => i).map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => handleTimeChange(day, type, currentHour, min, { close: true })}
                className={`block w-full rounded-md px-2 py-2 text-sm transition-colors ${
                  currentMinute === min ? 'bg-primary text-white hover:bg-primary/90' : 'hover:bg-gray-100'
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

  const syncFromDay = (day: Day) => {
    const sourceDay = getDayData(day);

    DAYS.forEach((targetDay) => {
      if (targetDay === day) return;
      setFieldValue(
        `workingHours.${targetDay}`,
        {
          open: sourceDay.open,
          close: sourceDay.close,
          isClosed: sourceDay.isClosed,
        },
        false
      );
    });
  };

  const workingHours = useMemo(() => {
    const result: Record<Day, WorkingDay> = {} as Record<Day, WorkingDay>;
    DAYS.forEach((day) => {
      result[day] = getDayData(day);
    });
    return result;
  }, [values.workingHours]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-purple-50 p-2">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Working Hours</h2>
            <p className="text-sm text-gray-500">
              Adjust opening and closing times for each day. Select an hour, then a minute to lock in a
              time.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => syncFromDay('monday')}
          className="inline-flex items-center gap-2 self-start rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
        >
          <Copy className="h-4 w-4" />
          Sync to all
        </button>
      </div>

      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
        {DAYS.map((day) => {
          const dayData = workingHours[day];
          const isPickerOpen = (type: 'open' | 'close') =>
            activePicker?.day === day && activePicker.type === type;

          return (
            <div key={day} className="grid gap-4 bg-gray-50 px-4 py-4 md:grid-cols-[140px_1fr_auto]">
              <div className="flex items-center text-sm font-semibold capitalize text-gray-900 min-w-0">
                {day}
              </div>

              {dayData.isClosed ? (
                <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-sm text-gray-500 md:col-span-1">
                  <span>Marked as closed</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  <div className="relative flex-1 min-w-[120px] max-w-[160px]">
                    <button
                      type="button"
                      onClick={() =>
                        setActivePicker(isPickerOpen('open') ? null : { day, type: 'open' })
                      }
                      className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#1c4233]"
                    >
                      <span>{dayData.open}</span>
                    </button>
                    {isPickerOpen('open') ? <TimePickerDropdown day={day} type="open" /> : null}
                  </div>

                  <span className="text-sm text-gray-500 flex-shrink-0">to</span>

                  <div className="relative flex-1 min-w-[120px] max-w-[160px]">
                    <button
                      type="button"
                      onClick={() =>
                        setActivePicker(isPickerOpen('close') ? null : { day, type: 'close' })
                      }
                      className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#1c4233]"
                    >
                      <span>{dayData.close}</span>
                    </button>
                    {isPickerOpen('close') ? <TimePickerDropdown day={day} type="close" /> : null}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-start md:justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => toggleClosed(day)}
                  className={`min-w-[110px] rounded-md px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${
                    dayData.isClosed
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {dayData.isClosed ? 'Mark open' : 'Mark closed'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}