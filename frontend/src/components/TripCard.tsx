
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CarFront } from "lucide-react";
import PassengerRow from "./AssignmentRow";

// This component now receives an array of all assignments that share the same trip
interface Props {
  tripData: any[];
}

export default function TripCard({ tripData }: Props) {
  if (!tripData || tripData.length === 0) return null;

  // All assignments in this array belong to the same driver and trip.
  // We can get the driver and trip info from the first assignment.
  const driver = tripData[0].driver;
  const tripInfo = tripData[0].trip;

  const handleRemovePassenger = (passengerId: string) => {
    console.log(`Request to remove passenger ${passengerId} from trip ${tripInfo.id}`);
    alert(`Logic to remove passenger ${passengerId} goes here.`);
  };

  return (
    <Card className="rounded-2xl shadow-lg bg-white border border-gray-200 mb-4 animate-fade-in">
      <CardHeader className="bg-gray-50 rounded-t-2xl border-b p-4">
        <div className="flex items-center gap-4">
            <span className="bg-gray-200 rounded-full p-3 flex items-center justify-center">
              <CarFront className="w-6 h-6 text-gray-700" />
            </span>
            <div className="flex flex-col">
                <span className="font-semibold text-xl text-gray-800">
                {driver.name}'s Trip
                </span>
                <span className="text-xs text-gray-500 font-mono">Trip ID: {tripInfo.id}</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
            {/* Sort passengers by their pickup time and render a row for each */}
            {tripData.sort((a, b) => new Date(a.estimatedPickupTime).getTime() - new Date(b.estimatedPickupTime).getTime())
             .map((assignment, index) => (
                <PassengerRow 
                    key={assignment.id}
                    passenger={assignment.passenger}
                    isPrimary={index === 0} // You can style the primary passenger differently
                    onRemove={() => handleRemovePassenger(assignment.passenger.id)}
                />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}