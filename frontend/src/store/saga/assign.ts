import axios from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  batchAssignError,
  batchAssignRequest,
  batchAssignSuccess,
  fetchAssignmentsFailure,
  fetchAssignmentsRequest,
  fetchAssignmentsSuccess,
} from "../redux/assignment";
import {
  assignDriverFailure,
  assignDriverRequest,
  assignDriverSuccess,
  fetchDriversFailure,
  fetchDriversRequest,
  fetchDriversSuccess,
  fetchUnassignedPassengersFailure,
  fetchUnassignedPassengersSuccess,
} from "../redux/reserveAssignment";

function* fetchAssignment() {
  try {
    const response = yield call(
      axios.get,
      "http://localhost:3000/api/v1/assignment/all-assignments"
    );
    yield put(fetchAssignmentsSuccess(response.data));
  } catch (error) {
    yield put(fetchAssignmentsFailure(error.message));
  }
}

function* assignBatch(action) {
  try {
    const res = yield call(
      axios.post,
      "http://localhost:3000/api/v1/assignment/trigger-assignment",
      action.payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    yield put(batchAssignSuccess(res.data));
  } catch (error) {
    yield put(batchAssignError(error.message));
  }
}

function* fetchDriversSaga(action) {
  try {
    const response = yield call(
      axios.post,
      "http://localhost:3000/api/v1/assignment/available-drivers",
      { ...action.payload, confirm: false },
      { headers: { "Content-Type": "application/json" } }
    );
    yield put(fetchDriversSuccess(response.data.rankedDrivers || []));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "An unexpected error occurred.";
    yield put(fetchDriversFailure(errorMessage));
  }
}

function* assignDriverSaga(action) {
  try {
    const response = yield call(
      axios.post, "http://localhost:3000/api/v1/assignment/assignSelectedDriver",
      { ...action.payload, confirm: true },
      { headers: { "Content-Type": "application/json" } }
    );
    yield put(
      assignDriverSuccess({
        message: response.data.message,
        assignment: response.data.assignment!,
      })
    );
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "An unexpected error occurred.";
    yield put(assignDriverFailure(errorMessage));
  }
}

function* fetchUnassignedPassengersSaga() {
  try {
    const res = yield call(
      axios.get,
      "http://localhost:3000/api/v1/assignment/unassigned"
    );
    yield put(fetchUnassignedPassengersSuccess(res.data));
  } catch (error) {
    yield put(fetchUnassignedPassengersFailure(error.message));
  }
}

function* watchAssignmentSaga() {
  yield takeLatest(fetchAssignmentsRequest.type, fetchAssignment);
}

function* watchBatchAssignSaga() {
  yield takeLatest(batchAssignRequest.type, assignBatch);
}

function* watchFetchDriversSaga() {
  yield takeLatest(fetchDriversRequest.type, fetchDriversSaga);
}

function* watchAssignDriverSaga() {
  yield takeLatest(assignDriverRequest.type, assignDriverSaga);
}
function* watcHBatchAssignSaga() {
  yield takeLatest(batchAssignRequest.type, assignBatch);
}

export {
  watchAssignmentSaga,
  watcHBatchAssignSaga,
  watchFetchDriversSaga,
  watchAssignDriverSaga,
  fetchUnassignedPassengersSaga,
};
