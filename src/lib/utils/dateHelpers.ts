// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get number of days in month
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Get calendar days for month view (including padding from adjacent months)
export const getCalendarDays = (date: Date): Array<{ date: Date; otherMonth: boolean }> => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  const startDay = firstDay.getDay() || 7;
  for (let i = startDay - 1; i > 0; i--) days.push({ date: new Date(year, month, 1 - i), otherMonth: true });
  for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), otherMonth: false });
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), otherMonth: true });

  return days;
};

// Check if date is weekend
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Check if date is today
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};
