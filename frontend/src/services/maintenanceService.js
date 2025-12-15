const API_BASE_URL = '/api/maintenance';

/**
 * Get all maintenance records
 */
export const getAllMaintenance = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch maintenance records');
    return await response.json();
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    throw error;
  }
};

/**
 * Get upcoming maintenance (next 30 days)
 */
export const getUpcomingMaintenance = async (days = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scheduled/upcoming?days=${days}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch upcoming maintenance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching upcoming maintenance:', error);
    throw error;
  }
};

/**
 * Get overdue maintenance
 */
export const getOverdueMaintenance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/scheduled/overdue`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch overdue maintenance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching overdue maintenance:', error);
    throw error;
  }
};

/**
 * Create regular maintenance record
 */
export const createMaintenance = async (maintenanceData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(maintenanceData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create maintenance');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating maintenance:', error);
    throw error;
  }
};

/**
 * Create scheduled maintenance
 */
export const createScheduledMaintenance = async (maintenanceData) => {
  try {
    // Convert numeric fields from strings to numbers
    let processedData = {
      ...maintenanceData,
      cost: maintenanceData.cost ? parseFloat(maintenanceData.cost) : 0,
      estimatedDuration: maintenanceData.estimatedDuration && maintenanceData.estimatedDuration !== ''
        ? parseFloat(maintenanceData.estimatedDuration) 
        : undefined
    };

    // Remove forbidden fields based on schedule type
    if (processedData.scheduleType === 'one-time') {
      // For one-time, remove recurring-specific fields
      delete processedData.frequency;
      delete processedData.recurrenceEndDate;
    }

    // Remove empty notes field
    if (!processedData.notes || processedData.notes.trim() === '') {
      delete processedData.notes;
    }

    console.log('Sending maintenance data to backend:', JSON.stringify(processedData, null, 2));

    const response = await fetch(`${API_BASE_URL}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(processedData)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Backend validation error:', responseData);
      
      // Extract detailed error messages if available
      let errorMessage = responseData.message || 'Failed to create scheduled maintenance';
      if (responseData.errors && Array.isArray(responseData.errors)) {
        errorMessage = responseData.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      }
      
      throw new Error(errorMessage);
    }
    return responseData;
  } catch (error) {
    console.error('Error creating scheduled maintenance:', error);
    throw error;
  }
};

/**
 * Update scheduled maintenance
 */
export const updateScheduledMaintenance = async (maintenanceId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule/${maintenanceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update maintenance');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating maintenance:', error);
    throw error;
  }
};

/**
 * Complete scheduled maintenance
 */
export const completeScheduledMaintenance = async (maintenanceId, completionData = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule/${maintenanceId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(completionData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete maintenance');
    }
    return await response.json();
  } catch (error) {
    console.error('Error completing maintenance:', error);
    throw error;
  }
};

/**
 * Cancel scheduled maintenance
 */
export const cancelScheduledMaintenance = async (maintenanceId, reason = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule/${maintenanceId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel maintenance');
    }
    return await response.json();
  } catch (error) {
    console.error('Error cancelling maintenance:', error);
    throw error;
  }
};

/**
 * Get maintenance statistics
 */
export const getMaintenanceStats = async (vehicleId = null) => {
  try {
    const url = vehicleId 
      ? `${API_BASE_URL}/stats?vehicleId=${vehicleId}`
      : `${API_BASE_URL}/stats`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch maintenance stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    throw error;
  }
};

/**
 * Get vehicle maintenance schedule
 */
export const getVehicleSchedule = async (vehicleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicle/${vehicleId}/schedule`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch vehicle schedule');
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicle schedule:', error);
    throw error;
  }
};

/**
 * Get upcoming maintenance
 */
export const getUpcomingScheduled = async (daysAhead = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scheduled/upcoming?days=${daysAhead}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch upcoming maintenance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching upcoming maintenance:', error);
    throw error;
  }
};
