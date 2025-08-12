
import { Card, CardContent } from "@/components/ui/card";
import { CarFront, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { CardActions } from "@mui/material";

interface Driver {
  id: number;
  name: string;
  location: string;
  status: string;
  onAssign: (driverId: number) => void;
}

type Props = Omit<Driver, "onAssign"> & {
  onAssign: (driverId: number) => void;
};

export default function DriverCard({ id, name, location, status, onAssign }: Props) {
  return (
    <Card className={clsx(
      "rounded-2xl shadow-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-white border border-indigo-100 flex flex-col justify-between h-full glass animate-fade-in"
    )}>
      <CardContent className="flex items-center gap-4 pt-7 pb-2">
        <span className="bg-purple-100 rounded-full p-4 mr-2 flex items-center justify-center shadow">
          <CarFront className="w-8 h-8 text-purple-700" />
        </span>
        <div>
          <div className="text-lg font-extrabold text-indigo-900">{name}</div>
          <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>Location:</span>
            <span className="inline-block font-medium text-indigo-600">{location}</span>
          </div>
        </div>
      </CardContent>
      <div className="flex items-center px-6 pb-3 justify-between">
        <span className={clsx(
          "text-xs font-bold rounded-full px-3 py-1",
          status === "Available"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-700"
        )}>
          {status}
        </span>
        <CardActions>
          <Button
            size="sm"
            variant="secondary"
            className="bg-indigo-500 hover:bg-indigo-700 text-white rounded-lg px-4 py-1 shadow-lg transition"
            disabled={status !== "Available"}
            onClick={() => onAssign(id)}
          >
            Assign
          </Button>
        </CardActions>
      </div>
    </Card>
  );
}
