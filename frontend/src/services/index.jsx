import api from './api'

// Vehicle services
export const getVehicles = async () => {
  const response = await api.get('/vehicles')
  return response.data
}

export const getVehicleById = async (id) => {
  const response = await api.get(`/vehicles/${id}`)
  return response.data
}

export const createVehicle = async (data) => {
  const response = await api.post('/vehicles', data)
  return response.data
}

export const updateVehicle = async (id, data) => {
  const response = await api.put(`/vehicles/${id}`, data)
  return response.data
}

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`)
  return response.data
}

// Driver services
export const getDrivers = async () => {
  const response = await api.get('/drivers')
  return response.data
}

export const getDriverById = async (id) => {
  const response = await api.get(`/drivers/${id}`)
  return response.data
}

export const createDriver = async (data) => {
  const response = await api.post('/drivers', data)
  return response.data
}

export const updateDriver = async (id, data) => {
  const response = await api.put(`/drivers/${id}`, data)
  return response.data
}

export const deleteDriver = async (id) => {
  const response = await api.delete(`/drivers/${id}`)
  return response.data
}

// Assignment services
export const getAssignments = async () => {
  const response = await api.get('/assignments')
  return response.data
}

export const createAssignment = async (data) => {
  const response = await api.post('/assignments', data)
  return response.data
}

export const endAssignment = async (id) => {
  const response = await api.put(`/assignments/${id}/end`)
  return response.data
}

// Fuel log services
export const getFuelLogs = async (params = {}) => {
  const response = await api.get('/fuels', { params })
  return response.data
}

export const createFuelLog = async (data) => {
  const response = await api.post('/fuels', data)
  return response.data
}

export const getFuelCostReport = async (params = {}) => {
  const response = await api.get('/fuels/reports/fuel-cost', { params })
  return response.data
}

// Maintenance services
export const getMaintenance = async (params = {}) => {
  const response = await api.get('/maintenance', { params })
  return response.data
}

export const getUpcomingMaintenance = async () => {
  const response = await api.get('/maintenance/upcoming')
  return response.data
}

export const createMaintenance = async (data) => {
  const response = await api.post('/maintenance', data)
  return response.data
}

export const updateMaintenance = async (id, data) => {
  const response = await api.put(`/maintenance/${id}`, data)
  return response.data
}

// Route services
export const getRoutes = async () => {
  const response = await api.get('/routes')
  return response.data
}

export const createRoute = async (data) => {
  const response = await api.post('/routes', data)
  return response.data
}

export const deleteRoute = async (id) => {
  const response = await api.delete(`/routes/${id}`)
  return response.data
}

// Report services
export const getCostPerKmReport = async (params = {}) => {
  const response = await api.get('/reports/cost-per-km', { params })
  return response.data
}
