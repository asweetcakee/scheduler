type PgError = { code?: string }

export const isUniqueViolation = (error: unknown): boolean => {
    return (error as PgError)?.code === '23505'
}

export const isInvalidTextRepresentation = (error: unknown): boolean => {
    return (error as PgError)?.code === '22P02'
}

export const isCheckViolation = (error: unknown): boolean => {
    return (error as PgError)?.code === '23514'
}

export const isExclusionViolation = (error: unknown): boolean => {
    return (error as PgError)?.code === '23P01'
}