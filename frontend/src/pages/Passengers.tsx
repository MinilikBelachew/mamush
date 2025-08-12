import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchPassengersRequest } from "../store/redux/passengers";
import { fetchDriverRequest } from "@/store/redux/driver";
import PassengerCard from "@/components/PassengerCard";
import PassengerAssignSelect from "@/components/PassengerAssignSelect";
import CsvUploadModal from "@/components/CsvUploadModal";
import MapComponent from "@/components/GoogleMapComponent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Passengers = () => {
  const dispatch = useDispatch();
  const { passengers, isLoading } = useSelector((state: RootState) => state.passengers);
  const { driver } = useSelector((state: RootState) => state.driver || []);
  const [view, setView] = useState<"card" | "table">("card");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(passengers.length / rowsPerPage);
  const paginatedPassengers = passengers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    dispatch(fetchPassengersRequest());
    dispatch(fetchDriverRequest());
  }, [dispatch]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const renderCardView = () => (
    <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {passengers.map((passenger) => (
        <Card key={passenger.id} className="p-0 flex flex-col relative shadow-lg hover:shadow-2xl transition-shadow animate-fade-in">
          <PassengerCard {...passenger} />
          <div className="absolute right-3 top-3 z-10">
            <PassengerAssignSelect
              drivers={driver}
              passengerId={passenger.id}
              disabled={driver.length === 0}
              onSuccess={() => {}}
            />
          </div>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full text-sm text-left text-gray-500 border rounded shadow-md">
          <thead className="text-xs uppercase bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Assign Driver</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPassengers.map((passenger) => (
              <tr key={passenger.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-4 py-2">{passenger.name}</td>
                <td className="px-4 py-2">{passenger.email}</td>
                <td className="px-4 py-2">{passenger.phone}</td>
                <td className="px-4 py-2">
                  <PassengerAssignSelect
                    drivers={driver}
                    passengerId={passenger.id}
                    disabled={driver.length === 0}
                    onSuccess={() => {}}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button disabled={currentPage === 1} onClick={handlePrev}>
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button disabled={currentPage === totalPages} onClick={handleNext}>
          Next
        </Button>
      </div>
    </>
  );

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-indigo-900 mb-2 tracking-tight">Passengers</h1>
          <p className="text-lg text-indigo-600">Manage and track passenger information</p>
        </div>
        <div className="flex gap-3 items-center">
          <Button onClick={() => setView(view === "card" ? "table" : "card")}>
            Switch to {view === "card" ? "Table View" : "Card View"}
          </Button>
          <CsvUploadModal />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400">Loading passengers...</div>
      ) : view === "card" ? (
        renderCardView()
      ) : (
        renderTableView()
      )}

      <div className="mt-8">
        <MapComponent driverLocation={driver[0]?.location} passengers={passengers} />
      </div>
    </div>
  );
};

export default Passengers;
