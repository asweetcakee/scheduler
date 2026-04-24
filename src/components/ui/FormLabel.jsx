const FormLabel = ({ 
  children,
  variant = 'default',
  className = '',
  ...props
 }) => {
  const styles = {
    default: 'text-sm font-medium text-slate-700',
    compact: 'text-xs font-normal text-slate-500'
  }

  const baseClasses = 'block mb-1'
  const variantClasses = styles[variant] || styles.default

  return (
    <label 
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}

export default FormLabel