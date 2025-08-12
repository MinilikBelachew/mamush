
import { CardContent } from "@/components/ui/card";
import { Users, MapPin, MapPinOff } from "lucide-react";

interface Passenger {
  id: number;
  name: string;
  group: number;
  pickup: string;
  dropoff: string;
}

export default function PassengerCard({ name, group, pickup, dropoff }: Passenger) {
  return (
    <CardContent className="flex flex-col gap-3 p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-100 to-white shadow-xl border border-indigo-100 glass animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center bg-indigo-100 rounded-full p-3">
          <Users className="text-purple-700 w-6 h-6" />
        </span>
        <div>
          <div className="text-xl font-bold text-purple-800">{name}</div>
          <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-block rounded px-2 py-0.5 bg-indigo-100 text-indigo-700 font-medium">
              Group: {group}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-indigo-50 rounded-lg p-3 flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-2 text-sm text-indigo-900">
          <MapPin className="w-5 h-5 mr-1" />
          <span className="font-semibold">Pickup:</span> <span>{pickup}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-purple-900">
          <MapPinOff className="w-5 h-5 mr-1" />
          <span className="font-semibold">Dropoff:</span> <span>{dropoff}</span>
        </div>
      </div>
    </CardContent>
  );
}
