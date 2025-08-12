import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

import DriverCard from "@/components/DriverCard";
import AssignModal from "@/components/AssignModal";
import { fetchDriverRequest } from "@/store/redux/driver";
import { fetchPassengersRequest } from "@/store/redux/passengers";

const Drivers = () => {
  const dispatch = useDispatch();
  const drivers = useSelector((state: RootState) => state.drivers.data);
  const driversLoading = useSelector((state: RootState) => state.drivers.isLoading);
  const passengers = useSelector((state: RootState) => state.passengers.data);
  const [assignId, setAssignId] = React.useState<number | null>(null);

  React.useEffect(() => {
    dispatch(fetchDriverRequest());
    dispatch(fetchPassengersRequest());
  }, [dispatch]);

  function handleAssign(driverId: number) {
    setAssignId(driverId);
  }
  function handleModalClose() {
    setAssignId(null);
  }
  function handleAssignPassenger(passengerId: number) {
    if (assignId === null) return;
    dispatch({ type: "ASSIGN_PASSENGER_REQUEST", payload: { driverId: assignId, passengerId } });
    setAssignId(null);
    dispatch(fetchAssignmentsRequest());
    dispatch(fetchPassengersRequest());
  }

  return (
    <div className="p-6 ">
      <h2 className="text-3xl font-bold mb-8 text-indigo-900">Drivers</h2>
      {driversLoading ? (
        <div className="text-center text-gray-400">Loading drivers...</div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {drivers.map((driver: any) => (
            <DriverCard key={driver.id} {...driver} onAssign={handleAssign} />
          ))}
        </div>
      )}
      <AssignModal
        open={assignId !== null}
        passengers={passengers}
        onClose={handleModalClose}
        onAssign={handleAssignPassenger}
      />
    </div>
  );
};

export default Drivers;
