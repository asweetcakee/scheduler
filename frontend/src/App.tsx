import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'


const testSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
})

type TestForm = z.infer<typeof testSchema>

const App = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestForm>({
    resolver: zodResolver(testSchema),
  })

  const onSubmit = (data: TestForm) => {
    console.log('Submitted:', data)
  }
  
  const { data, isLoading } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return 'React Query works'
    }
  })
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className='flex flex-col gap-4'>
        <h1 className="text-3xl font-bold text-blue-600">
          {isLoading ? 'Loading...' : data}
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 w-64">
          <input
            {...register('name')}
            placeholder="Name"
            className="border border-slate-300 rounded px-3 py-2"
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
          <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2">
            Submit
          </button>
        </form>        
      </div>
    </div>
  )
}

export default App