// Build personal top-10 rankings from raw Zepp swim workout records.
// Each workout: { start_time (unix sec), end_time (unix sec), distance (meters) }

const TARGET_DISTANCES = [50, 100, 200, 500, 1000, 1500]
const DISCIPLINE_MAP   = { 50: 'DIST_50', 100: 'DIST_100', 200: 'DIST_200', 500: 'DIST_500', 1000: 'DIST_1000', 1500: 'DIST_1500' }

export function processWorkouts(workouts) {
  const buckets = {
    DIST_50: [], DIST_100: [], DIST_200: [],
    DIST_500: [], DIST_1000: [], DIST_1500: [],
    LONGEST_TIME: [], LONGEST_DISTANCE: [],
  }

  workouts.forEach(w => {
    const distance  = w.distance  // meters
    const duration  = (w.end_time - w.start_time) // seconds
    const recordedAt = new Date(w.start_time * 1000).toISOString()

    if (!distance || !duration || duration <= 0) return

    buckets.LONGEST_TIME.push({ value: duration, recordedAt })
    buckets.LONGEST_DISTANCE.push({ value: distance, recordedAt })

    // Pace-based time for each target distance (linear extrapolation)
    TARGET_DISTANCES.forEach(d => {
      if (distance >= d) {
        const projected = (duration / distance) * d
        buckets[DISCIPLINE_MAP[d]].push({ value: projected, recordedAt })
      }
    })
  })

  const result = {}

  // Time disciplines: lower is better → sort ASC
  ;['DIST_50', 'DIST_100', 'DIST_200', 'DIST_500', 'DIST_1000', 'DIST_1500'].forEach(disc => {
    result[disc] = buckets[disc].sort((a, b) => a.value - b.value).slice(0, 10)
  })

  // Higher is better → sort DESC
  result.LONGEST_TIME     = buckets.LONGEST_TIME.sort((a, b) => b.value - a.value).slice(0, 10)
  result.LONGEST_DISTANCE = buckets.LONGEST_DISTANCE.sort((a, b) => b.value - a.value).slice(0, 10)

  return result
}
