
import { ArrowDown, ArrowUp } from "lucide-react";
import clsx from "clsx";

interface Stop {
  type: 'PICKUP' | 'DROPOFF';
  passengerId: string;
  lat: number;
  lng: number;
}

interface Props {
  stop: Stop;
  passengerName: string;
  stopTime: string;
  isLastStep: boolean;
}
const formatTime = (iso: string) => {
  const date = new Date(iso);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// const formatTime = (iso: string) =>
//   new Date(iso).toLocaleTimeString('en-US', {
//     timeZone: 'America/Denver',
//     hour: '2-digit',
//     minute: '2-digit',
//   });

export default function TimelineStep({ stop, passengerName, stopTime, isLastStep }: Props) {
  const isPickup = stop.type === 'PICKUP';

  return (
    <div className="relative flex items-start">
      {/* The vertical timeline line */}
      {!isLastStep && <div className="absolute left-4 top-5 h-full w-px bg-gray-300" />}
      
      {/* The icon circle */}
      <div className={clsx(
        "z-10 flex h-8 w-8 items-center justify-center rounded-full",
        isPickup ? "bg-green-100" : "bg-red-100"
      )}>
        {isPickup 
          ? <ArrowUp className="h-5 w-5 text-green-600" /> 
          : <ArrowDown className="h-5 w-5 text-red-600" />
        }
      </div>

      {/* The event details */}
      <div className="ml-4">
        <h4 className="font-semibold text-gray-800">
          {isPickup ? 'Pickup:' : 'Drop-off:'} {passengerName}
        </h4>
        <p className="mt-0.5 text-sm text-gray-500">
          Estimated Time: {formatTime(stopTime)}
        </p>
      </div>
    </div>
  );
}
