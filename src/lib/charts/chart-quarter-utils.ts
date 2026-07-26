const QUARTER_ORDER: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
}

const TIME_INTERVALS = ['0-15', '16-30', '31-45', '46-60', '61-75', '76-90']

export function sortQuarters(quarters: string[]) {
  return [...quarters].sort((left, right) => {
    const leftOrder = QUARTER_ORDER[left.toLowerCase()] ?? Number(left)
    const rightOrder = QUARTER_ORDER[right.toLowerCase()] ?? Number(right)
    return leftOrder - rightOrder
  })
}

export function getTimeInterval(quarter: string) {
  const quarterNum = QUARTER_ORDER[quarter.toLowerCase()] ?? Number(quarter)
  return TIME_INTERVALS[quarterNum - 1] ?? quarter
}
