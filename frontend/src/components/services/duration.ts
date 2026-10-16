export const minutesToSeconds = (minutes: number): number => {
    return Math.round(minutes * 60)
}

export const secondsToMinutes = (seconds: number): number => {
    return Math.round(seconds / 60)
}