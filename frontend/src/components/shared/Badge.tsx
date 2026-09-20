type BadgeVariant = 'success' | 'danger'

type BadgeProps = {
    variant: BadgeVariant, 
    text: string
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-status-active-bg text-status-active font-bold border-status-active-border',
    danger: 'bg-status-inactive-bg text-status-inactive font-bold border-status-inactive-border'
}

export const Badge = ({ variant, text }: BadgeProps) => {
    const baseStyle = 'px-3 py-2 flex justify-center items-center text-sm rounded-lg'
    return(
        <div className={`${baseStyle} ${variantStyles[variant]}`}>
            <span>{text}</span>
        </div>
    )
}