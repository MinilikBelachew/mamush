import { call, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  fetchDistanceRequest,
  fetchDistanceSuccess,
  fetchDistanceFailure,
  fetchRouteRequest,
  fetchRouteSuccess,
  fetchRouteFailure,
} from '../redux/location';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Distance Matrix API
function* fetchDistanceSaga(action) {
  try {
    const { origin, destination } = action.payload;

    const response = yield call(axios.get, 'https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        key: GOOGLE_MAPS_API_KEY,
        units: 'metric',
      },
    });

    const distanceInKm = response.data.rows[0].elements[0].distance.value / 1000;
    yield put(fetchDistanceSuccess(distanceInKm));
  } catch (error) {
    yield put(fetchDistanceFailure(error.message));
  }
}

// Directions API
function* fetchRouteSaga(action) {
  try {
    const { origin, destination } = action.payload;

    const response = yield call(axios.get, 'https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    const polyline = response.data.routes[0].overview_polyline.points;
    yield put(fetchRouteSuccess(polyline));
  } catch (error) {
    yield put(fetchRouteFailure(error.message));
  }
}

 function* WatchLocationSaga() {
  yield takeLatest(fetchDistanceRequest.type, fetchDistanceSaga);
  yield takeLatest(fetchRouteRequest.type, fetchRouteSaga);
}


export default WatchLocationSaga;