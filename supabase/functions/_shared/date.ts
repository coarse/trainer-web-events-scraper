export function getFormattedCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}-${day}-${year}`;
}

export function getTodayMidnight() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}
