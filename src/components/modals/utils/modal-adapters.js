export const transformStaffForCombobox = (staffList) => {
  return staffList.map(staff => ({
    id: staff.id,
    label: staff.name,
    sublabel: staff.role ?? undefined
  }))
}

export const transformClientsForCombobox = (clientsList) => {
  return clientsList.map(client => ({
    id: client.id,
    label: client.name,
    sublabel: client.phone ?? undefined
  }))
}

export const transformServicesForCombobox = (servicesList) => {
  return servicesList.map(service => ({
    id: service.id,
    label: service.name,
    sublabel: `${service.duration} м · ${service.price.toLocaleString('ru-RU')} ₸`,
  }))
}

