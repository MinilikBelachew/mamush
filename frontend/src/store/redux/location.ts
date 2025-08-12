import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  origin: null, // { lat, lng }
  destination: null, // { lat, lng }
  distance: null, // in km
  routePolyline: null, // polyline string
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setOrigin(state, action) {
      state.origin = action.payload;
    },
    setDestination(state, action) {
      state.destination = action.payload;
    },
    fetchDistanceRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDistanceSuccess(state, action) {
      state.distance = action.payload;
      state.loading = false;
    },
    fetchDistanceFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchRouteRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchRouteSuccess(state, action) {
      state.routePolyline = action.payload;
      state.loading = false;
    },
    fetchRouteFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    resetLocationData(state) {
      state.origin = null;
      state.destination = null;
      state.distance = null;
      state.routePolyline = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setOrigin,
  setDestination,
  fetchDistanceRequest,
  fetchDistanceSuccess,
  fetchDistanceFailure,
  fetchRouteRequest,
  fetchRouteSuccess,
  fetchRouteFailure,
  resetLocationData,
} = locationSlice.actions;

export default locationSlice.reducer;
