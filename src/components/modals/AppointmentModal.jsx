import { FormProvider, useForm } from "react-hook-form"
import { useSchedulerStore } from "../../store/useSchedulerStore"
import ModalHeader from "./sections/ModalHeader"
import { zodResolver } from "@hookform/resolvers/zod"
import { appointmentSchema } from "./schema/appointmentSchema"
import { useEffect } from "react"
import { DevTool } from "@hookform/devtools"
import MasterDateTimeSection from "./sections/section-one/MasterDateTimeSection"
import ClientInfoSection from "./sections/section-two/ClientInfoSection"
import ServicesSection from "./sections/section-three/ServicesSection"

const AppointmentModal = () => {
  const { modal, closeModal } = useSchedulerStore()
  const methods = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: modal.seedData
  })  

  // Handles the Grid handshake with modal
  useEffect(() => {
    console.log("AM - useEffect, modal:", modal)
    console.log("form values before reset:", methods.getValues())
    if (modal.isOpen) {
      methods.reset(modal.seedData)
      console.log("form values after reset:", methods.getValues())
    }
  }, [modal.isOpen, modal.seedData])

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
              <MasterDateTimeSection />
              <ClientInfoSection />
              <ServicesSection />
            </div>
          </form>
        </FormProvider>
        <DevTool control={methods.control} /> {/* Remove in production */}
      </div>
    </div>
  )
}

export default AppointmentModal