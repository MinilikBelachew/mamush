
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Passenger {
  id: string;
  name: string;
  pickupTime: string;
  pickupAddress: string;
  destination: string;
  contactNumber?: string;
  pickupCoordinates?: { lat: number; lng: number }; // Add this
  destinationCoordinates?: { lat: number; lng: number }; // Add this
  specialNotes?: string;
}

export interface PassengersState {
  data: Passenger[];
  loading: boolean;
  error: string | null;
  isImporting: boolean;
  previewData: unknown[] | null;
  passengers: Passenger[];
  isUploading: boolean; // Specific state for upload process
  uploadError: string | null;
}

const initialState: PassengersState = {
  data: [],
  loading: false,
  error: null,
  isImporting: false,
  previewData: null,
  passengers: [],
  isUploading: false,
  uploadError: null,
};

export const passengersSlice = createSlice({
  name: 'passengers',
  initialState,
  reducers: {
    importCsvRequest: (state, action: PayloadAction<File>) => {
      state.isImporting = true;
      state.error = null;
    },
    importCsvSuccess: (state, action: PayloadAction<unknown[]>) => {
      state.previewData = action.payload;
      state.isImporting = false;
    },
    importCsvFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isImporting = false;
    },
    confirmImport: (state) => {
      state.loading = true;
      state.error = null;
    },
    confirmImportSuccess: (state, action: PayloadAction<Passenger[]>) => {
      state.data = action.payload;
      state.previewData = null;
      state.loading = false;
    },
    confirmImportFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearPreviewData: (state) => {
      state.previewData = null;
    },

    uploadCsvRequest: (state, action: PayloadAction<File>) => {
      state.isUploading = true;
      state.uploadError = null;
      state.error = null; // Clear general errors too
    },
    // Action on successful upload
    uploadCsvSuccess: (state, action: PayloadAction<{ message: string; count?: number }>) => { // Adjust payload based on API response
      state.isUploading = false;
      // Optionally update passengers list here if API returns them,
      // but fetching fresh list might be better (handled in saga)
    },
    // Action on failed upload
    uploadCsvFailure: (state, action: PayloadAction<string>) => {
      state.uploadError = action.payload;
      state.isUploading = false;
    },
    fetchPassengersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPassengersSuccess: (state, action: PayloadAction<Passenger[]>) => {
      state.passengers = action.payload;
      state.loading = false;
  },
    fetchPassengersFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  importCsvRequest,
  importCsvSuccess,
  importCsvFailure,
  confirmImport,
  confirmImportSuccess,
  confirmImportFailure,
  clearPreviewData,
  fetchPassengersRequest,
  fetchPassengersSuccess,
  fetchPassengersFailure,
  uploadCsvRequest,
  uploadCsvSuccess,
  uploadCsvFailure,
} = passengersSlice.actions;

export default passengersSlice.reducer;