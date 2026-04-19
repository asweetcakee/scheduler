import { FormProvider, useForm } from "react-hook-form"
import { useSchedulerStore } from "../../store/useSchedulerStore"
import ModalHeader from "./sections/ModalHeader"
import { zodResolver } from "@hookform/resolvers/zod"
import { appointmentSchema } from "./schema/appointmentSchema"
import { useEffect } from "react"
import { DevTool } from "@hookform/devtools"

const AppointmentModal = () => {
  const { modal, closeModal } = useSchedulerStore()
  const methods = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: modal.seedData
  })  

  useEffect(() => {
    if (modal.isOpen) {
      methods.reset(modal.seedData)
    }
  }, [modal.isOpen, modal.seedData, methods.reset])

  const onSubmit = (data) => {
    console.log('Form submitted with data:', data)
    closeModal()
  }

  if (!modal.isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={closeModal}
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl overflow-y-auto max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader mode={modal.mode}/>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto"
          >
            <div className="px-5 py-4 space-y-6">
              {/* Test Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Staff ID</label>
                <input 
                  {...methods.register("staffId")} 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              {/* Hidden or visible time input to check the seed */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input 
                  {...methods.register("startTime")} 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          </form>
          <DevTool control={methods.control} /> {/* Remove in production */}
        </FormProvider>
      </div>
    </div>
  )
}

export default AppointmentModal