
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { driversReducer } from "./features/driversSlice";
import { passengersReducer } from "./features/passengersSlice";
import { assignmentsReducer } from "./features/assignmentsSlice";
import rootSaga from "./features/rootSaga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    drivers: driversReducer,
    passengers: passengersReducer,
    assignments: assignmentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
