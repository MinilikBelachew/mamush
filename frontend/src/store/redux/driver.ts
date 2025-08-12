
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface Car {
  id: string;          
  licensePlate: string;
  driverName?: string;
  capacity: number;
  currentAddress?: string; 
  currentLat: number;  
  currentLng: number;  
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'; 
}

export interface AddCarPayload {
  licensePlate: string;
  driverName?: string;
  capacity?: number; 
  currentAddress: string; nt
  status?: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
}


export interface CarsState {
  driver: Car[];
  loadingAdd: boolean; 
  errorAdd: string | null; 
  loadingFetch: boolean;
  errorFetch: string | null;
}

// Updated initial state
const initialState: CarsState = {
  driver: [], 
  loadingAdd: false,
  errorAdd: null,
  loadingFetch: false, 
  errorFetch: null,
};

// Renamed vehiclesSlice -> carsSlice
export const carsSlice = createSlice({
  name: 'cars', // Slice name updated
  initialState,
  reducers: {

    addCarRequest: (state, action: PayloadAction<AddCarPayload>) => {
      state.loadingAdd = true;
      state.errorAdd = null;
    },
    addCarSuccess: (state, action: PayloadAction<Car>) => {
      state.loadingAdd = false;
      state.driver.push(action.payload);
      // state.ca = action.payload; // Store success message
    },
    addCarFailure: (state, action: PayloadAction<string>) => {
      state.loadingAdd = false;
      state.errorAdd = action.payload; // Store error message
    },


    updateCar: (state, action: PayloadAction<Car>) => {
      const index = state.driver.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.driver[index] = action.payload;
      }
    },
    removeCar: (state, action: PayloadAction<string>) => {
      state.driver = state.driver.filter(c => c.id !== action.payload);
    },

    fetchDriverRequest: (state) => {
        state.loadingFetch = true;
        state.errorFetch = null;
    },
    fetchDriverSuccess: (state, action: PayloadAction<Car[]>) => {
        state.loadingFetch = false;
        state.driver = action.payload;
    },
    fetchDriverFailure: (state, action: PayloadAction<string>) => {
        state.loadingFetch = false;
        state.errorFetch = action.payload;
    },
  }
});

// Export actions
export const {
  addCarRequest,
  addCarSuccess,
  addCarFailure,
  updateCar,
  removeCar,
  fetchDriverRequest,
  fetchDriverSuccess,
  fetchDriverFailure,
 
} = carsSlice.actions;

// Export reducer
export default carsSlice.reducer;
