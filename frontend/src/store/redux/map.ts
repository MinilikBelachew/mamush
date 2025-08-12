import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  drivers: [],
  passengers: [],
  assignments: [],
  selectedRoute: null,
  distanceMatrix: {},
  loading: false,
  error: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setDrivers(state, action) {
      state.drivers = action.payload;
    },
    setPassengers(state, action) {
      state.passengers = action.payload;
    },
    assignDriverToPassenger(state, action) {
      state.assignments.push(action.payload);
    },
    setSelectedRoute(state, action) {
      state.selectedRoute = action.payload;
    },
    setDistanceMatrix(state, action) {
      state.distanceMatrix = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setDrivers,
  setPassengers,
  assignDriverToPassenger,
  setSelectedRoute,
  setDistanceMatrix,
  setLoading,
  setError,
} = mapSlice.actions;

export default mapSlice.reducer;
