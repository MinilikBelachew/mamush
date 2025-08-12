import axios from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import { fetchPassengersFailure, fetchPassengersRequest, fetchPassengersSuccess } from "../redux/passengers";
import exp from "constants";


function* getPassengerSaga() {
    try {
        const response = yield call(axios.get, "http://localhost:3000/api/v1/passengers/all-passengers")
        yield put(fetchPassengersSuccess(response.data));
    } catch (error) {
        yield put(fetchPassengersFailure(error.message)); 
    }
}


function* watchPassengerSaga() {
    yield takeLatest(fetchPassengersRequest.type, getPassengerSaga);
}

export {watchPassengerSaga}