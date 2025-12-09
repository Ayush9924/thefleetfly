import { useCallback } from 'react'
import { useRealtime } from '../contexts/RealtimeContext'

export const useSocketLocation = () => {
  const { socket, locations } = useRealtime()

  const subscribeToLocationUpdates = useCallback(
    (callback) => {
      if (!socket) return () => {}

      const handleLocationUpdate = (data) => {
        const locationData = {
          driverId: data.driverId,
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed || 0,
          heading: data.heading || 0,
          timestamp: data.timestamp || new Date().toISOString(),
          accuracy: data.accuracy || null,
          altitude: data.altitude || null,
        }
        callback(locationData)
      }

      socket.on('driver:location_update', handleLocationUpdate)
      return () => {
        socket.off('driver:location_update', handleLocationUpdate)
      }
    },
    [socket]
  )

  const emitLocation = useCallback(
    (locationData) => {
      if (!socket) return

      socket.emit('driver:location_update', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        speed: locationData.speed || 0,
        heading: locationData.heading || 0,
        accuracy: locationData.accuracy || null,
        altitude: locationData.altitude || null,
      })
    },
    [socket]
  )

  const requestDriverLocation = useCallback(
    (driverId) => {
      if (!socket) return
      socket.emit('driver:request_location', { driverId })
    },
    [socket]
  )

  const joinLocationRoom = useCallback(
    (driverIds) => {
      if (!socket) return
      socket.emit('room:join_location', {
        drivers: Array.isArray(driverIds) ? driverIds : [driverIds],
      })
    },
    [socket]
  )

  const leaveLocationRoom = useCallback(
    (driverIds) => {
      if (!socket) return
      socket.emit('room:leave_location', {
        drivers: Array.isArray(driverIds) ? driverIds : [driverIds],
      })
    },
    [socket]
  )

  return {
    subscribeToLocationUpdates,
    emitLocation,
    requestDriverLocation,
    joinLocationRoom,
    leaveLocationRoom,
    locations,
    isConnected: !!socket?.connected,
  }
}

