export type TripStatus = 'upcoming' | 'active' | 'past';

export function getTripStatus(start_date: string | null, end_date: string | null): TripStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!start_date) return 'upcoming';
  const start = new Date(start_date);
  start.setHours(0, 0, 0, 0);

  if (today < start) return 'upcoming';

  if (end_date) {
    const end = new Date(end_date);
    end.setHours(23, 59, 59, 999);
    if (today > end) return 'past';
  }

  return 'active';
}

export const STATUS_COLORS: Record<TripStatus, string> = {
  upcoming: 'bg-amber text-white',
  active: 'bg-amber text-white animate-pulse-glow',
  past: 'bg-teal text-white',
};

export const STATUS_LABELS: Record<TripStatus, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  past: 'Past',
};
