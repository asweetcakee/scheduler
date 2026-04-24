export const resetStartTimeOnMasterChange = (id, seedData) => {
  return id === seedData?.staffId && seedData?.startTime
    ? seedData.startTime
    : ''
}