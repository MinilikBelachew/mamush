import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDriversRequest,
  assignDriverRequest,
  setSelectedDriver,
} from '../store/redux/reserveAssignment';

const AssignReservesForm = ({ scheduledDate }) => {
  const [passengerId, setPassengerId] = useState('');
  const dispatch = useDispatch();

  const {
    loading,
    error,
    success,
    rankedDrivers,
    selectedDriverId,
    unassignedPassengers = [],
  } = useSelector((state) => state.assignReserves);

  const formattedScheduledDate = scheduledDate
    ? new Date(scheduledDate).toISOString().split('T')[0] + 'T12:00:00Z'
    : undefined;

  const handleFetchDrivers = (e) => {
    e.preventDefault();
    if (!passengerId) return;
    dispatch(fetchDriversRequest({ passengerId, scheduledDate: formattedScheduledDate }));
  };

  const handleAssignDriver = (e) => {
    e.preventDefault();
    if (!selectedDriverId || !passengerId) return;
    dispatch(
      assignDriverRequest({
        passengerId,
        scheduledDate: formattedScheduledDate,
        driverId: selectedDriverId,
      })
    );
  };

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Single Passenger</h2>

      {/* Passenger Dropdown */}
      <form onSubmit={handleFetchDrivers} className="space-y-4">
        <div>
          <label htmlFor="passengerId" className="block text-sm font-medium text-gray-700">
            Select Unassigned Passenger
          </label>
          <select
            id="passengerId"
            value={passengerId}
            onChange={(e) => setPassengerId(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
          >
            <option value="" className="text-gray-500">-- Select a passenger --</option>
            {unassignedPassengers.map((passenger) => (
              <option key={passenger.id} value={passenger.id} className="text-black">
                {passenger.name || `Passenger ${passenger.id}`} (ID: {passenger.id})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !passengerId}
          className={`w-full px-4 py-2 text-white rounded-lg ${
            loading || !passengerId ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Fetching...' : 'Fetch Available Drivers'}
        </button>
      </form>

      {/* Driver Dropdown */}
      {rankedDrivers && rankedDrivers.length > 0 && (
        <form onSubmit={handleAssignDriver} className="mt-4 space-y-4">
          <div>
            <label htmlFor="driverSelect" className="block text-sm font-medium text-gray-700">
              Select Driver
            </label>
            <select
              id="driverSelect"
              value={selectedDriverId || ''}
              onChange={(e) => dispatch(setSelectedDriver(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black"
            >
              <option value="" disabled>
                Select a driver
              </option>
              {rankedDrivers.map((driver) => (
                <option key={driver.id} value={driver.id} className="text-black">
                  Driver {driver.id} ({driver.status}, ETA: {new Date(driver.estimatedArrivalTime).toLocaleTimeString()})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !selectedDriverId}
            className={`w-full px-4 py-2 text-white rounded-lg ${
              loading || !selectedDriverId ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Assigning...' : 'Assign Driver'}
          </button>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
          <p>{success.message}</p>
          {success.assignment && (
            <div className="mt-2">
              <h3 className="text-md font-semibold">Assignment Details</h3>
              <p>Assignment ID: {success.assignment.id}</p>
              <p>Driver ID: {success.assignment.driverId}</p>
              <p>Passenger ID: {success.assignment.passengerId}</p>
              <p>Estimated Pickup: {new Date(success.assignment.estimatedPickupTime).toLocaleString()}</p>
              <p>Status: {success.assignment.status}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignReservesForm;
