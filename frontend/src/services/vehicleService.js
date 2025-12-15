import axios from 'axios';

const API_URL = '/api/vehicles';

export const vehicleService = {
  // Get all vehicles
  async getAllVehicles() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single vehicle
  async getVehicle(vehicleId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create vehicle
  async createVehicle(vehicleData) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_URL, vehicleData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update vehicle
  async updateVehicle(vehicleId, vehicleData) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/${vehicleId}`, vehicleData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete vehicle
  async deleteVehicle(vehicleId) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update vehicle location
  async updateVehicleLocation(vehicleId, location) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/${vehicleId}/location`,
        location,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get vehicle location history
  async getVehicleLocationHistory(vehicleId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/${vehicleId}/location-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get vehicles by status
  async getVehiclesByStatus(status) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
