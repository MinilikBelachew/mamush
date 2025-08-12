import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Assignment {
  id: string;
  driverId: string;
  passengerId: string;
  estimatedPickupTime: string;
  status: string;
}

interface Passenger {
  id: string;
  name: string;
  phone: string;
}

interface RankedDriver {
  id: string;
  status: string;
  travelTimeInSeconds: number;
  estimatedArrivalTime: string;
}

interface AssignReservesState {
  loading: boolean;
  error: string | null;
  success: { message: string; assignment?: Assignment } | null;
  rankedDrivers: RankedDriver[] | null;
  unassignedPassengers: Assignment[] | null;
  selectedDriverId: string | null;
}

const initialState: AssignReservesState = {
  loading: false,
  error: null,
  success: null,
  rankedDrivers: null,
  selectedDriverId: null,
  unassignedPassengers: null,
};

const assignReservesSlice = createSlice({
  name: 'assignReserves',
  initialState,
  reducers: {
    fetchDriversRequest(state, action: PayloadAction<{ passengerId: string; scheduledDate?: string }>) {
      state.loading = true;
      state.error = null;
      state.rankedDrivers = null;
      state.selectedDriverId = null;
    },
    fetchDriversSuccess(state, action: PayloadAction<RankedDriver[]>) {
      state.loading = false;
      state.rankedDrivers = action.payload;
      state.selectedDriverId = action.payload[0]?.id || null; // Default to first driver
    },
    fetchDriversFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    assignDriverRequest(
      state,
      action: PayloadAction<{ passengerId: string; scheduledDate?: string; driverId: string }>
    ) {
      state.loading = true;
      state.error = null;
      state.success = null;
    },
    assignDriverSuccess(state, action: PayloadAction<{ message: string; assignment: Assignment }>) {
      state.loading = false;
      state.success = action.payload;
      state.rankedDrivers = null;
      state.selectedDriverId = null;
    },
    assignDriverFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchUnassignedRequest(state) {
      state.loading = true;
      state.error = null;

    },
    fetchUnassignedPassengersSuccess(state, action: PayloadAction<Assignment[]>) {
      state.loading = false;
      state.success = null; 
      state.unassignedPassengers = action.payload;
      state.error = null;
    },
    fetchUnassignedPassengersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.unassignedPassengers = null;
    },
    setSelectedDriver(state, action: PayloadAction<string>) {
      state.selectedDriverId = action.payload;
    },
  },
});

export const {
  fetchDriversRequest,
  fetchDriversSuccess,
  fetchDriversFailure,
  assignDriverRequest,
  assignDriverSuccess,
  assignDriverFailure,
  setSelectedDriver,
  fetchUnassignedRequest,
  fetchUnassignedPassengersSuccess,
  fetchUnassignedPassengersFailure,
} = assignReservesSlice.actions;
export default assignReservesSlice.reducer;