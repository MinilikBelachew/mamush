
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

interface Passenger {
  id: number;
  name: string;
  group: number;
  pickup: string;
  dropoff: string;
}

export interface AssignModalProps {
  open: boolean;
  passengers: Passenger[];
  onClose: () => void;
  onAssign: (passengerId: number) => void;
}

export default function AssignModal({
  open,
  passengers,
  onClose,
  onAssign,
}: AssignModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Select Passenger to Assign</DialogTitle>
      <DialogContent>
        {passengers.length === 0 ? (
          <Typography>No passengers available for assignment.</Typography>
        ) : (
          <List>
            {passengers.map((p) => (
              <ListItemButton key={p.id} onClick={() => onAssign(p.id)}>
                <ListItemText
                  primary={p.name + (p.group > 1 ? ` (Group: ${p.group})` : "")}
                  secondary={`Pickup: ${p.pickup} — Dropoff: ${p.dropoff}`}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
