import { useState, useCallback } from 'react';
import * as maintenanceService from '../services/maintenanceService';

export const useMaintenanceScheduler = () => {
  const [data, setData] = useState({
    all: [],
    upcoming: [],
    overdue: [],
    stats: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all maintenance data
   */
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allMaintenance, upcoming, overdue, stats] = await Promise.all([
        maintenanceService.getAllMaintenance(),
        maintenanceService.getUpcomingMaintenance(30),
        maintenanceService.getOverdueMaintenance(),
        maintenanceService.getMaintenanceStats()
      ]);

      setData({
        all: allMaintenance,
        upcoming,
        overdue,
        stats
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch maintenance data');
      console.error('Error in fetchAllData:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new scheduled maintenance
   */
  const createScheduled = useCallback(async (maintenanceData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newMaintenance = await maintenanceService.createScheduledMaintenance(maintenanceData);
      
      // Update local data
      setData(prev => ({
        ...prev,
        all: [newMaintenance, ...prev.all],
        upcoming: [newMaintenance, ...prev.upcoming].sort(
          (a, b) => new Date(a.nextScheduledDate) - new Date(b.nextScheduledDate)
        )
      }));
      
      return newMaintenance;
    } catch (err) {
      setError(err.message || 'Failed to create maintenance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Complete a scheduled maintenance
   */
  const complete = useCallback(async (maintenanceId, completionData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const updated = await maintenanceService.completeScheduledMaintenance(maintenanceId, completionData);
      
      // Update local data
      setData(prev => ({
        ...prev,
        all: prev.all.map(item => item._id === maintenanceId ? updated : item),
        upcoming: prev.upcoming.filter(item => item._id !== maintenanceId),
        overdue: prev.overdue.filter(item => item._id !== maintenanceId)
      }));
      
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to complete maintenance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancel a scheduled maintenance
   */
  const cancel = useCallback(async (maintenanceId, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const updated = await maintenanceService.cancelScheduledMaintenance(maintenanceId, reason);
      
      // Update local data
      setData(prev => ({
        ...prev,
        all: prev.all.map(item => item._id === maintenanceId ? updated : item),
        upcoming: prev.upcoming.filter(item => item._id !== maintenanceId),
        overdue: prev.overdue.filter(item => item._id !== maintenanceId)
      }));
      
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to cancel maintenance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a scheduled maintenance
   */
  const update = useCallback(async (maintenanceId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updated = await maintenanceService.updateScheduledMaintenance(maintenanceId, updateData);
      
      // Update local data
      setData(prev => ({
        ...prev,
        all: prev.all.map(item => item._id === maintenanceId ? updated : item),
        upcoming: prev.upcoming.map(item => item._id === maintenanceId ? updated : item)
      }));
      
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update maintenance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get vehicle schedule
   */
  const getVehicleSchedule = useCallback(async (vehicleId) => {
    try {
      setLoading(true);
      setError(null);
      const schedule = await maintenanceService.getVehicleSchedule(vehicleId);
      return schedule;
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicle schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  return {
    data,
    loading,
    error,
    fetchAllData,
    createScheduled,
    complete,
    cancel,
    update,
    getVehicleSchedule,
    refresh,
    setError
  };
};

export default useMaintenanceScheduler;
