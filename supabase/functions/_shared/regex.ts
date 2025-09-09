export function getId(url: string) {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) {
    return -1;
  }

  return parseInt(match[1], 10);
}

export function getCapacity(str: string) {
  const match = str.match(/(\d+) People/);
  if (!match) {
    return -1;
  }

  return parseInt(match[1], 10);
}

export function getDate(str: string) {
  const match = str.match(/\b(\d{2})\.(\d{2})\.(\d{4})\b/);
  if (!match) {
    return new Date(0).toISOString();
  }

  const [, month, day, year] = match; // destructure groups
  const date = new Date(Number(year), Number(month) - 1, Number(day)); // month is 0-based

  return date.toISOString();
}
