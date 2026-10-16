import type { ISODate } from '../schemas/scheduleSchema'

const BUSINESS_TIME_ZONE = 'Asia/Almaty'

export const getToday = (): ISODate =>
	new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE }).format(new Date())

export const formatDate = (dateStr: ISODate): string => {
	const date = new Date(dateStr)
	const formatter = new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	})

	return formatter
		.format(date)
		.replace(/\./g, '')
		.replace(/\s?г$/, '')
}

export const dayBefore = (dateStr: ISODate): ISODate => {
	const date = new Date(dateStr)
	date.setUTCDate(date.getUTCDate() - 1)
	return date.toISOString().slice(0, 10)
}

export const dayAfter = (dateStr: ISODate): ISODate => {
	const date = new Date(dateStr)
	date.setUTCDate(date.getUTCDate() + 1)
	return date.toISOString().slice(0, 10)
}