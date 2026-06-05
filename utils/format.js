// Format seconds as mm:ss.s or ss.s
export function formatTime(seconds) {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    const s = (seconds % 60).toFixed(1).padStart(4, '0')
    return `${m}:${s}`
  }
  return `${seconds.toFixed(1)}s`
}

// Format meters
export function formatDistance(meters) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(2)}km`
    : `${Math.round(meters)}m`
}

export function formatValue(discipline, value) {
  return discipline === 'LONGEST_DISTANCE'
    ? formatDistance(value)
    : formatTime(value)
}

// Convert ArrayBuffer to JSON
export function ab2json(buf) {
  const arr = new Uint8Array(buf)
  let str = ''
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i])
  return JSON.parse(str)
}

// Convert object to ArrayBuffer
export function json2ab(obj) {
  const str = JSON.stringify(obj)
  const arr = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i)
  return arr.buffer
}
