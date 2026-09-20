export const formatPhoneDisplay = (digits: string): string => {
    let result = ''

    if (digits.length > 0) result += ` (${ digits.slice(0, 3) }`
    if (digits.length >= 3) result += ')'
    if (digits.length > 3) result += ` ${digits.slice(3, 6)}`
    if (digits.length > 6) result += `-${digits.slice(6, 8)}`
    if (digits.length > 8) result += `-${digits.slice(8, 10)}`
    
    return result
}

const validOperatorCodes = ['700','701','702','703','704','705','706','707','708','709','747','750','751','760','761','762','763','764','771','775','776','777','778']

export const normalizePhoneInput = (raw: string): string => {
    const digitsOnly = raw.replace(/\D/g, '')
    return digitsOnly.slice(0, 10)
}

export const normalizePastedPhone = (raw: string): string => {
    const digitsOnly = raw.replace(/\D/g, '')
    if (digitsOnly.length >= 11 && (digitsOnly.startsWith('7') || digitsOnly.startsWith('8'))) {
        const result = digitsOnly.slice(1, 11)
        return validOperatorCodes.includes(result.slice(0, 3)) ? result : digitsOnly.slice(0, 10)
    }
    return digitsOnly.slice(0, 10)
}

export const getUpdatedDigits = (raw: string, oldDigits: string): string => {
    const newDigits = normalizePhoneInput(raw)
    const isMaskCharDeleted = 
        newDigits.length === oldDigits.length 
        && raw.length < formatPhoneDisplay(oldDigits).length
    return isMaskCharDeleted ? newDigits.slice(0, -1) : newDigits
}