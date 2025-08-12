

import { createSlice } from "@reduxjs/toolkit";

interface Assignment {
  id: number;
  driver: { id: number; name: string };
  passenger: { id: number; name: string };
  status: string;
  eta: string;
  batchAssign: string
}

interface AssignmentsState {
  assignment: Assignment[];
  isLoading: boolean;
  error: string | null;
  batchAssign: string | null
}

const initialState: AssignmentsState = {
  assignment: [],
  isLoading: false,
  error: null,
  batchAssign:null
};

const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    fetchAssignmentsRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchAssignmentsSuccess(state, action) {
      state.assignment = action.payload;
      state.isLoading = false;
    },
    fetchAssignmentsFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    invalidateAssignments(state) {
      state.assignment = [];
      state.isLoading = false;
      state.error = null;
    },
     batchAssignRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    batchAssignSuccess(state,action) {
      state.batchAssign = action.payload;
      state.error = null;
      state.isLoading = false
    },
    batchAssignError(state,action) {
      state.isLoading = false;
      state.error = action.payload
    }
  },
});

export const {
  fetchAssignmentsRequest,
  fetchAssignmentsSuccess,
  fetchAssignmentsFailure,
  invalidateAssignments,
  batchAssignError,
  batchAssignRequest,
  batchAssignSuccess
} = assignmentsSlice.actions;

export const assignmentsReducer = assignmentsSlice.reducer;
export default assignmentsSlice.reducer;