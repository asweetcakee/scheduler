export class ApiError extends Error {
    status: number
    body: unknown

    constructor (status: number, body: unknown, message: string) {
        super(message)
        this.status = status
        this.body = body
    }
}