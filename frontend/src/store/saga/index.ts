import { all } from "redux-saga/effects";
import { watchPassengerSaga } from "./passenger";
import WatchLocationSaga from "./location";
import { watchDriverSaga } from "./driver";
import {
  fetchUnassignedPassengersSaga,
  watchAssignDriverSaga,
  watchAssignmentSaga,
  watcHBatchAssignSaga,
  watchFetchDriversSaga,
} from "./assign";

export default function* rootSaga() {
  yield all([
    WatchLocationSaga(),
    watchPassengerSaga(),
    watchDriverSaga(),
    watchAssignmentSaga(),
    watcHBatchAssignSaga(),
    watchAssignDriverSaga(),
    watchFetchDriversSaga(),
    fetchUnassignedPassengersSaga()
  ]);
}
