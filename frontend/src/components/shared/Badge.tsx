type BadgeVariant = 'success' | 'danger' | 'info' | 'muted' | 'pending'

type BadgeProps = {
    variant: BadgeVariant, 
    text: string,
    sizes?: string
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-status-active-bg text-status-active font-bold border-status-active-border',
    danger: 'bg-status-inactive-bg/40 text-status-inactive font-bold border-status-inactive-border',
    info: 'bg-primary/10 text-primary font-bold border-primary/20',
    muted: 'bg-page text-text-secondary font-bold border-border',
    pending: 'bg-page text-status-pending font-semibold border-border'
}

export const Badge = ({ variant, text, sizes = 'px-3 py-2' }: BadgeProps) => {
    const baseStyle = 'flex justify-center items-center text-sm rounded-md'
    return(
        <div className={`${sizes} ${baseStyle} ${variantStyles[variant]}`}>
            <span>{text}</span>
        </div>
    )
}