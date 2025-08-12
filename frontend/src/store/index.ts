import { combineReducers, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./saga/index";
import passengersReducer from "./redux/passengers";
// import routesReducer from './';
import driverSlice from "./redux/driver";
import locationSlice from "./redux/location";
import assignementSlice from "./redux/assignment";
import assignReservesReducer from "./redux/reserveAssignment";
import storage from "redux-persist/lib/storage";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = {
  passengers: passengersReducer,
  // routes: routesReducer,
  driver: driverSlice,
  location: locationSlice,
  assignment: assignementSlice,
  assignReserves: assignReservesReducer
};

// You can persist only specific slices if needed
const persistedReducer = persistReducer(
  {
    key: "root",
    storage,
    // whitelist: ['passengers', 'vehicles'], // Optional: Choose slices to persist
  },
  combineReducers(rootReducer)
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
