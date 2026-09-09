const toTiyins = (tenge) => Math.round(tenge * 100)
const toTenge = (tiyins) => (tiyins / 100).toFixed(2)

module.exports = { toTiyins, toTenge }