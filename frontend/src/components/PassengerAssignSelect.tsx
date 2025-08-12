
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { toast } from "@/hooks/use-toast";

interface Driver {
  id: number;
  name: string;
}

type Props = {
  drivers: Driver[];
  passengerId: number;
  disabled?: boolean;
  onSuccess?: () => void;
};

export default function PassengerAssignSelect({
  drivers,
  passengerId,
  disabled,
  onSuccess
}: Props) {
  const dispatch = useDispatch();
  const [selected, setSelected] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  const handleAssign = () => {
    if (!selected) {
      toast({ title: "Please select a driver." });
      return;
    }
    setLoading(true);
    dispatch({
      type: "ASSIGN_PASSENGER_REQUEST",
      payload: { driverId: Number(selected), passengerId },
      meta: {
        onSettled: () => {
          setLoading(false);
          setSelected("");
          if (onSuccess) onSuccess();
          toast({ title: "Assignment successful!", description: "Passenger assigned to driver." });
        },
      },
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <Select value={selected} onValueChange={setSelected} disabled={disabled || loading}>
        <SelectTrigger className="min-w-[120px] bg-white border-gray-300 shadow focus:ring-indigo-400">
          <SelectValue placeholder="Assign driver" />
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          {drivers.map(d => (
            <SelectItem key={d.id} value={d.id.toString()}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="secondary"
        className="ml-1 bg-indigo-500 hover:bg-indigo-700 text-white"
        disabled={!selected || disabled || loading}
        onClick={handleAssign}
      >
        {loading ? "Assigning..." : "Assign"}
      </Button>
    </div>
  );
}
