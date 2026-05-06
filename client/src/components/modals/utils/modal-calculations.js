export const roundToCents = (n) => parseFloat(n.toFixed(2))
export const clamp  = (val, min, max) => Math.min(max, Math.max(min, val))
const calculateDiscountValue = (price, percent) => {
  return parseFloat((price * percent / 100).toFixed(2))
}
const calculateTotal = (price, discountValue) => {
  return parseFloat((price - discountValue).toFixed(2))
}
export const calculatePricing = (price, percent) => {
  if (percent <= 0) {
    return {
      discountValue: 0,
      total: price
    }
  }
  const discountValue = calculateDiscountValue(price, percent)
  const total = calculateTotal(price, discountValue)
  return {
    discountValue,
    total
  }
}
export const calculatePercentFromValue = (price, discountValue) => {
  if (price <= 0) return 0
  return parseFloat((discountValue / price * 100).toFixed(2))
}

export const calculateSlotTime = (index, minutesPerSlot) => {
  const minutes = (index + 1) * minutesPerSlot
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return {
    totalMinutes: minutes,
    minutesToFormat: m,
    hoursToFormat: h
  }
}