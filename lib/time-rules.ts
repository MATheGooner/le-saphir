export function dayOfWeek(date: string) { return new Date(`${date}T12:00:00Z`).getUTCDay(); }
export function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number); const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
export function trimTime(time: string) { return time.slice(0, 5); }
export function isFutureLocal(date: string, time: string, nowDate: string, nowTime: string) { return date > nowDate || (date === nowDate && time > nowTime); }
export function fitsWindow(time: string, openTime: string, closeTime: string) { return time >= trimTime(openTime) && time < trimTime(closeTime); }
