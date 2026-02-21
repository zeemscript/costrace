export function fillDateGaps(
  data: { date: string; cost: number; calls: number; tokens_in: number; tokens_out: number }[],
  startDate: Date,
  endDate: Date
): { date: string; cost: number; calls: number; tokens_in: number; tokens_out: number }[] {
  const map = new Map(data.map((d) => [d.date, d]))
  const result: typeof data = []

  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    const key = current.toISOString().slice(0, 10)
    result.push(
      map.get(key) ?? { date: key, cost: 0, calls: 0, tokens_in: 0, tokens_out: 0 }
    )
    current.setDate(current.getDate() + 1)
  }

  return result
}
