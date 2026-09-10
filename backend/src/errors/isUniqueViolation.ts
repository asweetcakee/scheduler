type PgError = { code?: string }

export const isUniqueViolation = (error: unknown): boolean => {
    return (error as PgError)?.code === '23505'
}