export const formatPhoneDisplay = (digits: string): string => {
    let result = ''

    if (digits.length > 0) result += ` (${ digits.slice(0, 3) }`
    if (digits.length >= 3) result += ')'
    if (digits.length > 3) result += ` ${digits.slice(3, 6)}`
    if (digits.length > 6) result += `-${digits.slice(6, 8)}`
    if (digits.length > 8) result += `-${digits.slice(8, 10)}`
    
    return result
}