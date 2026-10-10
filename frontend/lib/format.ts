const dateTime = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Dhaka',
});

const amount = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400],
  ['month', 30 * 86_400],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

export const formatDateTime = (iso: string): string => dateTime.format(new Date(iso));

export const formatRelativeTime = (iso: string, now: number = Date.now()): string => {
  const seconds = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  const match = RELATIVE_UNITS.find(([, size]) => seconds >= size);

  return match ? relative.format(-Math.floor(seconds / match[1]), match[0]) : 'just now';
};

export const formatMoney = (value: number | string): string =>
  `BDT ${amount.format(Number(value))}`;
