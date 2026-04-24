import { useClientDiscounts } from '../../hooks/useClientDiscounts'
import ClientCombobox from './ClientCombobox'

const ClientInfoSection = () => {
  useClientDiscounts()
  
  return (
    <section>
      <ClientCombobox />
    </section>
  )
}

export default ClientInfoSection