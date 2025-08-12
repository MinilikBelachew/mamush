import axios from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import { fetchDriverFailure, fetchDriverRequest, fetchDriverSuccess } from "../redux/driver";

function* getDriverSaga() {
    try {
        const response = yield call(axios.get, "http://localhost:3000/api/v1/drivers/all-drivers");
        yield put(fetchDriverSuccess(response.data));
    } catch (error) {
        yield put(fetchDriverFailure(error.message));
    }
}

function* watchDriverSaga() {
    yield takeLatest(fetchDriverRequest.type, getDriverSaga);
}

export { watchDriverSaga };