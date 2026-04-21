import ClientCombobox from './ClientCombobox'
import { useClientDiscounts } from '../../../hooks/useClientDiscounts'

const ClientSection = () => {
  // Activates the watch -> fetch -> recompute pipeline
  useClientDiscounts()

  return (
    <section>
      <ClientCombobox />
    </section>
  )
}

export default ClientSection