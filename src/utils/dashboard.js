export function parseTimeValue(value) {
  const match = /^(\d{2})-(\d{2})\s(\d{2}):(\d{2})$/.exec(value || "")

  if (!match) {
    return 0
  }

  const [, month, day, hour, minute] = match.map(Number)
  return (((month * 31) + day) * 24 * 60) + (hour * 60) + minute
}

export function sortIntelCards(cards = []) {
  return [...cards].sort((a, b) => {
    const timeDiff = parseTimeValue(b.time) - parseTimeValue(a.time)

    if (timeDiff !== 0) {
      return timeDiff
    }

    return (b.score || 0) - (a.score || 0)
  })
}

export function getTopIntelCards(cards = [], limit = 3) {
  return sortIntelCards(cards)
    .slice()
    .sort((a, b) => {
      const scoreDiff = (b.score || 0) - (a.score || 0)

      if (scoreDiff !== 0) {
        return scoreDiff
      }

      return parseTimeValue(b.time) - parseTimeValue(a.time)
    })
    .slice(0, limit)
}
