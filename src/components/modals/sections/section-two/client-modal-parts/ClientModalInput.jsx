import { useFormContext } from "react-hook-form"

const ClientModalInput = ({ name, label, placeholder }) => {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        {...register(name)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {errors[name] && (              // ← also fixes the original bug
        <p className="mt-1 text-xs text-red-500">{errors[name].message}</p>
      )}
    </div>
  )
}

export default ClientModalInput