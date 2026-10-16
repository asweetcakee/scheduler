type BodyParseError = {
    type?: string
    status?: number
}

export const isBodyParseError = (error: unknown): boolean => {
    const e = error as BodyParseError
    return e?.type === 'entity.parse.failed' && e?.status === 400
}