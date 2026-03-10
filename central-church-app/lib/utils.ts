import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek } from 'date-fns';

/** Formats an event start time for display on cards */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);

  if (isToday(date)) return `Today · ${format(date, 'h:mm a')}`;
  if (isTomorrow(date)) return `Tomorrow · ${format(date, 'h:mm a')}`;
  if (isThisWeek(date)) return format(date, 'EEEE · h:mm a');
  return format(date, 'MMM d · h:mm a');
}

/** Formats a prayer request submission time */
export function formatPrayerDate(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

/** Formats duration in seconds to mm:ss or h:mm:ss */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}
