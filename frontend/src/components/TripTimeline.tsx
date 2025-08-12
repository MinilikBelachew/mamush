
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CarFront, Users } from "lucide-react";
import TimelineStep from "./TimelineStep";

export default function TripTimeline({ tripData }: { tripData: any[] }) {
  if (!tripData || tripData.length === 0) return null;

  const driver = tripData[0].driver;
  const tripInfo = tripData[0].trip;
  
  // The orderedWaypointsJson is the source of truth for the trip's sequence
  const orderedStops = tripInfo.orderedWaypointsJson || [];
  
  // Create a quick lookup map for passenger names
  const passengerMap = new Map(tripData.map(a => [a.passenger.id, a.passenger.name]));

  // We need to find the estimated time for each stop from the assignment data
  const getStopTime = (stop: any): string => {
    const assignment = tripData.find(a => a.passengerId === stop.passengerId);
    if (!assignment) return "";
    return stop.type === 'PICKUP' ? assignment.estimatedPickupTime : assignment.estimatedDropoffTime;
  }

  return (
    <Card className="rounded-2xl shadow-lg bg-white border border-gray-200 mb-6">
      <CardHeader className="bg-gray-50 rounded-t-2xl border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="bg-gray-200 rounded-full p-3">
              <CarFront className="w-6 h-6 text-gray-700" />
            </span>
            <div>
                <h3 className="font-semibold text-xl text-gray-800">{driver.name}'s Trip</h3>
                <p className="text-xs text-gray-500 font-mono">Trip ID: {tripInfo.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18}/>
            <span className="font-bold">{tripData.length}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {orderedStops.map((stop: any, index: number) => (
            <TimelineStep
              key={`${stop.passengerId}-${stop.type}-${index}`}
              stop={stop}
              passengerName={passengerMap.get(stop.passengerId) || "Unknown"}
              stopTime={getStopTime(stop)}
              isLastStep={index === orderedStops.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}