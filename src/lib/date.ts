export function parseDate(dateString: string) {
  let date = new Date(dateString)
  let current = new Date()
  let dayDifference = getDayOfYear(current) - getDayOfYear(date)
  let timePart: 'numeric' | undefined =
    dayDifference > 0 && dayDifference < 14 ? undefined : 'numeric'

  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: date.getFullYear() == current.getFullYear() ? undefined : 'numeric',
    month: 'short',
    day: 'numeric',
    hour: timePart,
    minute: timePart,
  })
}

const daysKey = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function getDayOfYear(date: Date) {
  return daysKey[date.getMonth() - 1] + date.getDate()
}
