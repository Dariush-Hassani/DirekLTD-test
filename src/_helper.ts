export function getWeekDayName(weekDayNumber: number): string {
  if (weekDayNumber === 0) return "Mo";
  else if (weekDayNumber === 1) return "Tu";
  else if (weekDayNumber === 2) return "We";
  else if (weekDayNumber === 3) return "Th";
  else if (weekDayNumber === 4) return "Fr";
  else if (weekDayNumber === 5) return "Sa";
  else if (weekDayNumber === 6) return "Su";
  else return "";
}
export function formatHoursMinuts(hoursMinutes: string): string {
  let rv = "";
  let hourMin = hoursMinutes.split(":");
  let hour = hourMin[0];
  let min = hourMin[1];
  if (min && min.length < 2) min = "0" + min;
  if (parseInt(hour)) rv += `${hour}h `;
  if (parseInt(min)) rv += `${min}m`;
  if (!parseInt(hour) && !parseInt(min)) rv = "0";
  return rv;
}
