const locale = 'ar-SY';

const toDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function formatDate(value?: string | null, includeYear = true) {
  const date = toDate(value);
  if (!date) {
    return 'غير محدد';
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    ...(includeYear ? { year: 'numeric' } : {}),
  }).format(date);
}

export function formatTime(value?: string | null) {
  const date = toDate(value);
  if (!date) {
    return 'غير محدد';
  }

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatNumber(value?: number | null, fallback = 'لا يوجد') {
  if (value === null || value === undefined) {
    return fallback;
  }

  return new Intl.NumberFormat(locale).format(value);
}

export function calculateAge(birthDate?: string | null) {
  const date = toDate(birthDate);
  if (!date) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  return age;
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
