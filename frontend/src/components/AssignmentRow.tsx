// src/components/PassengerRow.tsx

import { User, X } from "lucide-react";
import clsx from "clsx";

// Define the types for a passenger within a trip
interface PassengerInTrip {
  id: string;
  name: string;
  estimatedPickupTime: string;
  estimatedDropoffTime: string;
}

interface Props {
  passenger: PassengerInTrip;
  isPrimary?: boolean; // Is this the first passenger of the trip?
  onRemove?: (passengerId: string) => void;
}

const formatTime =  (raw: string) => {
  const iso = raw.replace(' ', 'T') + ':00'; // now ISO format
  const [_, timeWithOffset] = iso.split('T');
  const [time] = timeWithOffset.split('-'); // remove -04:00
  return time.slice(0, 5); // "01:15"
};

export default function PassengerRow({
  passenger,
  isPrimary = false,
  onRemove,
}: Props) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between p-3 rounded-lg mb-2",
        isPrimary ? "bg-indigo-100" : "bg-green-100"
      )}
    >
      <div className="flex items-center gap-3">
        <User
          className={clsx(
            "w-5 h-5",
            isPrimary ? "text-indigo-700" : "text-green-800"
          )}
        />
        <span className="font-medium text-gray-800">{passenger.name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-gray-600">
          {formatTime(passenger.estimatedPickupTime)} -{" "}
          {formatTime(passenger.estimatedDropoffTime)}
        </span>
        {!isPrimary && onRemove && (
          <button
            onClick={() => onRemove(passenger.id)}
            className="p-1 rounded-full hover:bg-red-200 text-red-600 transition-colors"
            title={`Remove ${passenger.name} from trip`}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
