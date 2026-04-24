const FormFieldError = ({ error, className = '' }) => {
  if (!error?.message) return
  
  return (
    <p className={`mt-1 text-xs text-red-500 ${className}`}>{error.message}</p>
  )
}

export default FormFieldError