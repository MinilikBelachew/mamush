
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const getDrivers = async () => {
  // MOCK: Replace with real API call later
  return [
    { id: 1, name: "Alice West", location: "Downtown", status: "Available" },
    { id: 2, name: "Rick Smith", location: "Airport", status: "En Route" },
    { id: 3, name: "Janet Lee", location: "Suburbs", status: "Available" },
  ];
};

export const getPassengers = async () => {
  return [
    { id: 11, name: "Carlos V.", group: 2, pickup: "Central Park", dropoff: "Main St." },
    { id: 12, name: "Dana X.", group: 1, pickup: "Airport", dropoff: "City Center" },
  ];
};

export const getAssignments = async () => {
  return [
    {
      id: 21,
      driver: { id: 1, name: "Alice West" },
      passenger: { id: 12, name: "Dana X." },
      status: "Ongoing",
      eta: "10 min",
    },
    {
      id: 22,
      driver: { id: 1, name: "Darn sds" },
      passenger: { id: 12, name: "fd." },
      status: "Ongoing",
      eta: "10 min",
    },
    {
      id: 23,
      driver: { id: 1, name: "Mand eas" },
      passenger: { id: 12, name: "dff Y." },
      status: "Ongoing",
      eta: "10 min",
    },
  ];
};

export const assignPassenger = async (driverId: number, passengerId: number) => {
  // MOCK: Replace with real POST
  return { success: true };
};

