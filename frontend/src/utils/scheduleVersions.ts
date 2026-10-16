import type { ISODate } from '../schemas/scheduleSchema'
import type { ScheduleVersionResponse } from '../types/schedule'

type VersionStatus = 'historical' | 'current' | 'future'

export type ClassifiedVersion = ScheduleVersionResponse & {
	status: VersionStatus
    number: number | null
}

type ClassifiedVersions = {
	sorted: ClassifiedVersion[],
	historical: ClassifiedVersion[],
	current: ClassifiedVersion | null,
	future: ClassifiedVersion[],
	next: ClassifiedVersion | null
}

export const classifyVersions = (versions: ScheduleVersionResponse[], today: ISODate): ClassifiedVersions => {
	const sortedAsc = [...versions].sort((a, b) => 
		a.effective_from < b.effective_from
			? -1 
			: a.effective_from > b.effective_from
				? 1 : 0
	)
	const currentIndex = sortedAsc.findLastIndex((version) => version.effective_from <= today)

	const sorted: ClassifiedVersion[] = sortedAsc.map((version, index) => {
		let status: VersionStatus = 'future'
		if (currentIndex !== -1) {
			if (index < currentIndex) status = 'historical'
			if (index === currentIndex) status = 'current'
		}
		return {
			...version,
			status,
			number: status === 'future' ? null : index + 1
		}
	})

	const historical = sorted.filter((version) => version.status === 'historical')
	const current = currentIndex === -1 ? null : sorted[currentIndex] ?? null
	const future = sorted.filter((version) => version.status === 'future')
	const next = future[0] ?? null

	return {
		sorted,
		historical: [...historical].reverse(),
		current,
		future,
		next
	}
}