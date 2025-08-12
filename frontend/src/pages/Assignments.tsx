import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import MapGL, { Marker, Popup, Layer, NavigationControl } from "react-map-gl";
import { MapboxSource } from "@/components/MapboxSource";
import "mapbox-gl/dist/mapbox-gl.css";
import { batchAssignRequest, fetchAssignmentsRequest } from "@/store/redux/assignment";
import { fetchDriversRequest, assignDriverRequest, setSelectedDriver } from "@/store/redux/reserveAssignment";
import { Car, User, MapPin, Calendar, Search, Filter, Layers, Route, Clock, MapIcon, CheckCircle, AlertTriangle } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import AssignReservesForm from "@/components/reservePassenger"

dayjs.extend(utc);

// Error Boundary Component
type ErrorBoundaryState = { hasError: boolean };

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 text-red-800 rounded-lg shadow-md border border-red-200 flex items-center">
          <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
          <div>
            <h3 className="font-bold">Map Error</h3>
            <p>Something went wrong with the map. Please try refreshing the page.</p>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactNode;
  }
}

// --- Constants ---
const routeColors = [
  "#4F46E5", // indigo
  "#0891B2", // cyan
  "#D946EF", // fuchsia
  "#DB2777", // pink
  "#F59E0B", // amber
  "#10B981", // emerald
];

const Assignments = () => {
  const dispatch = useDispatch();
  const { assignment, isLoading } = useSelector((state: any) => state.assignment as any);

  const [date, setDate] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFullRoutes, setShowFullRoutes] = useState(true);
  const [showAssignmentRoutes, setShowAssignmentRoutes] = useState(true);
  const [showDriverToPickup, setShowDriverToPickup] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const [showDetailPanel, setShowDetailPanel] = useState(true);
  const [reassignPassengerId, setReassignPassengerId] = useState<string | null>(null);

  const handleBatchAssign = () => {
    const payload = { date };
    dispatch({ type: batchAssignRequest.type, payload });
  };

  // --- State Management ---
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [assignmentRoutes, setAssignmentRoutes] = useState(new Map());
  const [driverToPickupRoutes, setDriverToPickupRoutes] = useState(new Map());
  const [driverFullRoutes, setDriverFullRoutes] = useState(new Map());
  const [viewport, setViewport] = useState({
    latitude: 39.7392,
    longitude: -104.9903,
    zoom: 10,
  });
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef<any>(null);

  // Active passenger pickup -> dropoff road route (Mapbox directions)
  const [activePickupDropoffRoute, setActivePickupDropoffRoute] = useState<any>(null);
  // Active driver -> pickup road route
  const [activeDriverToPickupRoute, setActiveDriverToPickupRoute] = useState<any>(null);
  // Active driver's dynamic origin for marker (prev dropoff or current position)
  const [activeDriverOrigin, setActiveDriverOrigin] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchActiveRoute = async () => {
      if (!activeAssignmentId || !assignment) {
        setActivePickupDropoffRoute(null);
        return;
      }
      const active = assignment.find((a: any) => String(a.id) === String(activeAssignmentId));
      if (!active || !active.passenger) {
        setActivePickupDropoffRoute(null);
        return;
      }
      const pickupLng = active.passenger.pickupLng ?? 0;
      const pickupLat = active.passenger.pickupLat ?? 0;
      const dropoffLng = active.passenger.dropoffLng ?? 0;
      const dropoffLat = active.passenger.dropoffLat ?? 0;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}?geometries=geojson&overview=full&access_token=${import.meta.env.VITE_MAPBOX_API_KEY}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          setActivePickupDropoffRoute(null);
          return;
        }
        const data = await response.json();
        if (data.routes && data.routes[0]?.geometry) {
          const feature = {
            type: "Feature",
            properties: { assignmentId: String(active.id) },
            geometry: data.routes[0].geometry,
          };
          setActivePickupDropoffRoute({ type: "FeatureCollection", features: [feature] });
        } else {
          setActivePickupDropoffRoute(null);
        }
      } catch (e) {
        setActivePickupDropoffRoute(null);
      }
    };

    fetchActiveRoute();
  }, [activeAssignmentId, assignment]);

  // Auto-fit map to active route bounds
  useEffect(() => {
    if (!mapRef.current || !activePickupDropoffRoute) return;
    try {
      const feature = activePickupDropoffRoute.features?.[0];
      const coords: [number, number][] = feature?.geometry?.coordinates || [];
      if (!coords || coords.length < 2) return;
      // Compute bounds
      let minLng = coords[0][0];
      let minLat = coords[0][1];
      let maxLng = coords[0][0];
      let maxLat = coords[0][1];
      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
      if (minLng === maxLng && minLat === maxLat) return;
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 80, duration: 800 }
      );
    } catch {}
  }, [activePickupDropoffRoute]);

  // Fetch and render active driver -> pickup route
  useEffect(() => {
    const fetchDriverToPickup = async () => {
      if (!activeAssignmentId || !assignment) {
        setActiveDriverToPickupRoute(null);
        return;
      }
      const active = assignment.find((a: any) => String(a.id) === String(activeAssignmentId));
      if (!active || !active.passenger || !active.driver) {
        setActiveDriverToPickupRoute(null);
        setActiveDriverOrigin(null);
        return;
      }

      // Determine dynamic origin: previous dropoff of the same driver, else current driver location
      const driverId = String(active.driverId ?? active.driver?.id ?? "unknown");
      let originLng = active.driver.currentLng ?? 0;
      let originLat = active.driver.currentLat ?? 0;
      // Derive driver sequence from assignments to avoid TDZ on driverGroups
      const driverList = (assignment as any[])
        .filter((a) => String(a.driverId ?? a.driver?.id ?? "unknown") === driverId)
        .sort((a, b) => new Date(a.estimatedPickupTime).getTime() - new Date(b.estimatedPickupTime).getTime());
      const idx = driverList.findIndex((a: any) => String(a.id) === String(active.id));
      if (idx > 0) {
        const prev = driverList[idx - 1];
        const prevDropLng = prev?.passenger?.dropoffLng;
        const prevDropLat = prev?.passenger?.dropoffLat;
        if (typeof prevDropLng === "number" && typeof prevDropLat === "number") {
          originLng = prevDropLng;
          originLat = prevDropLat;
        }
      }

      const pickupLng = active.passenger.pickupLng ?? 0;
      const pickupLat = active.passenger.pickupLat ?? 0;
      // Basic guard against invalid zeros
      if ((Math.abs(originLng) < 0.001 && Math.abs(originLat) < 0.001) || (Math.abs(pickupLng) < 0.001 && Math.abs(pickupLat) < 0.001)) {
        setActiveDriverToPickupRoute(null);
        setActiveDriverOrigin(null);
        return;
      }
      setActiveDriverOrigin([originLng, originLat]);
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${pickupLng},${pickupLat}?geometries=geojson&overview=full&access_token=${import.meta.env.VITE_MAPBOX_API_KEY}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          setActiveDriverToPickupRoute(null);
          return;
        }
        const data = await response.json();
        if (data.routes && data.routes[0]?.geometry) {
          const feature = {
            type: "Feature",
            properties: { assignmentId: String(active.id) },
            geometry: data.routes[0].geometry,
          };
          setActiveDriverToPickupRoute({ type: "FeatureCollection", features: [feature] });
        } else {
          setActiveDriverToPickupRoute(null);
        }
      } catch (e) {
        setActiveDriverToPickupRoute(null);
      }
    };

    fetchDriverToPickup();
  }, [activeAssignmentId, assignment]);

  useEffect(() => {
    const mapObj: any = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current;
    if (!mapObj) return;

    const sourceId = "active-driver-pickup";
    const layerId = "active-driver-pickup-layer";

    const removeIfExists = () => {
      try { if (mapObj.getLayer(layerId)) mapObj.removeLayer(layerId); } catch {}
      try { if (mapObj.getSource(sourceId)) mapObj.removeSource(sourceId); } catch {}
    };

    if (!activeDriverToPickupRoute) {
      removeIfExists();
      return;
    }

    const addOrUpdate = () => {
      try {
        if (mapObj.getSource(sourceId)) {
          const src: any = mapObj.getSource(sourceId);
          if (src && src.setData) src.setData(activeDriverToPickupRoute);
        } else {
          mapObj.addSource(sourceId, { type: "geojson", data: activeDriverToPickupRoute });
        }
        if (!mapObj.getLayer(layerId)) {
          mapObj.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": "#3b82f6", // blue
              "line-width": 5,
              "line-opacity": 0.95,
            },
          });
        }
      } catch (e) {
        if (mapObj && mapObj.on) {
          const handler = () => { try { addOrUpdate(); } finally { mapObj.off("styledata", handler); } };
          mapObj.on("styledata", handler);
        }
      }
    };

    addOrUpdate();
    return () => { removeIfExists(); };
  }, [activeDriverToPickupRoute]);

  // Manually render active route source/layer to avoid dev overlay prop injection issues
  useEffect(() => {
    const mapObj: any = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current;
    if (!mapObj) return;

    const sourceId = "active-pickup-dropoff";
    const layerId = "active-pickup-dropoff-layer";

    const removeIfExists = () => {
      try {
        if (mapObj.getLayer(layerId)) mapObj.removeLayer(layerId);
      } catch {}
      try {
        if (mapObj.getSource(sourceId)) mapObj.removeSource(sourceId);
      } catch {}
    };

    if (!activePickupDropoffRoute) {
      removeIfExists();
      return;
    }

    const addOrUpdate = () => {
      try {
        if (mapObj.getSource(sourceId)) {
          const src: any = mapObj.getSource(sourceId);
          if (src && src.setData) src.setData(activePickupDropoffRoute);
        } else {
          mapObj.addSource(sourceId, { type: "geojson", data: activePickupDropoffRoute });
        }
        if (!mapObj.getLayer(layerId)) {
          mapObj.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": "#16a34a",
              "line-width": 6,
              "line-opacity": 0.85,
            },
          });
        }
      } catch (e) {
        // Retry once when style is not yet loaded
        if (mapObj && mapObj.on) {
          const handler = () => {
            try { addOrUpdate(); } finally { mapObj.off("styledata", handler); }
          };
          mapObj.on("styledata", handler);
        }
      }
    };

    addOrUpdate();

    return () => {
      removeIfExists();
    };
  }, [activePickupDropoffRoute]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 1024;
      setIsMobileView(newIsMobile);
      if (newIsMobile) setShowDetailPanel(false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Data Transformation ---
  const { driverGroups, totalAssignments } = useMemo(() => {
    if (!assignment) return { driverGroups: new Map(), totalAssignments: 0 };

    const groups = new Map();

    for (const assign of assignment) {
      const driverId = String(assign.driverId ?? assign.driver?.id ?? "unknown");
      if (!groups.has(driverId)) groups.set(driverId, []);
      groups.get(driverId).push(assign);
    }

    // Sort assignments within each driver group by pickup time
    groups.forEach((assignmentList) => {
      assignmentList.sort(
        (a, b) =>
          new Date(a.estimatedPickupTime).getTime() -
          new Date(b.estimatedPickupTime).getTime()
      );
    });

    return { driverGroups: groups, totalAssignments: assignment.length };
  }, [assignment]);

  // Map driver id to stable colors for route rendering
  const driverColorPairs = useMemo(() => {
    const ids = Array.from(driverGroups.keys());
    return ids.flatMap((id, i) => [id, routeColors[i % routeColors.length]]);
  }, [driverGroups]);

  // Reassign state from store
  const {
    loading: reassignLoading,
    rankedDrivers,
    selectedDriverId,
    success: reassignSuccess,
  } = useSelector((state: any) => state.assignReserves || {});

  // Close reassign panel on success and refresh assignments
  useEffect(() => {
    if (reassignSuccess) {
      setReassignPassengerId(null);
      dispatch(fetchAssignmentsRequest());
    }
  }, [reassignSuccess, dispatch]);

  const formattedScheduledDate = useMemo(() => {
    if (!date) return undefined as string | undefined;
    const d = new Date(date);
    const iso = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0)).toISOString();
    return iso;
  }, [date]);

  const openReassignForPassenger = (passengerId: string) => {
    setReassignPassengerId(passengerId);
    dispatch(fetchDriversRequest({ passengerId, scheduledDate: formattedScheduledDate }));
  };

  const confirmReassign = (passengerId: string) => {
    if (!selectedDriverId) return;
    dispatch(
      assignDriverRequest({
        passengerId,
        scheduledDate: formattedScheduledDate,
        driverId: selectedDriverId,
      })
    );
  };

  // Filters
  const filterAssignment = (assign) => {
    const statusMatch = filterStatus === "ALL" || assign.status === filterStatus;
    const q = searchTerm.trim().toLowerCase();
    const searchMatch =
      q.length === 0 ||
      (assign.passenger?.name?.toLowerCase().includes(q) ?? false) ||
      (assign.driver?.name?.toLowerCase().includes(q) ?? false) ||
      (`${assign.driver?.firstName ?? ""} ${assign.driver?.lastName ?? ""}`
        .toLowerCase()
        .includes(q));
    return statusMatch && searchMatch;
  };

  const visibleDriverEntries = useMemo(() => {
    return Array.from(driverGroups.entries())
      .map(([driverId, list]) => [driverId, list.filter(filterAssignment)])
      .filter(([_, list]) => list.length > 0);
  }, [driverGroups, filterStatus, searchTerm]);

  // --- Data Fetching ---
  useEffect(() => {
    dispatch(fetchAssignmentsRequest());
  }, [dispatch]);

  // --- Route Calculation ---
  useEffect(() => {
    if (!assignment || assignment.length === 0) return;

    const fetchRoutes = async () => {
      // These will be arrays of features for batching
      const driverFullRouteFeatures = [];
      const assignmentRouteFeatures = [];
      const driverToPickupFeatures = [];

      // Group assignments by driver
      const driverAssignments: Record<string, any[]> = {};
      for (const assign of assignment) {
        const dId = String(assign.driverId ?? assign.driver?.id ?? "unknown");
        if (!driverAssignments[dId]) driverAssignments[dId] = [];
        driverAssignments[dId].push(assign);
      }

      // For each driver, fetch the full multi-stop route from Mapbox
      const driverRoutePromises = Object.entries(driverAssignments).map(
        async ([driverId, assigns]) => {
          if ((assigns as any[]).length === 0) return;
          // Build waypoints: driver location, pickup1, dropoff1, pickup2, dropoff2, ...
          const coords = [];
          coords.push([
            (assigns as any[])[0].driver.currentLng ?? 0,
            (assigns as any[])[0].driver.currentLat ?? 0,
          ]);
          for (const assign of assigns as any[]) {
            coords.push([
              assign.passenger.pickupLng ?? 0,
              assign.passenger.pickupLat ?? 0,
            ]);
            coords.push([
              assign.passenger.dropoffLng ?? 0,
              assign.passenger.dropoffLat ?? 0,
            ]);
          }
          // Build the Mapbox Directions API URL
          const coordStr = coords
            .map(([lng, lat]) => `${lng},${lat}`)
            .join(";");
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&access_token=${
            import.meta.env.VITE_MAPBOX_API_KEY
          }`;
          try {
            const response = await fetch(url);
            if (!response.ok) {
              console.error(
                `Error fetching full route for driver ${driverId}: ${response.statusText}`
              );
              return;
            }
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
              const routeGeometry = data.routes[0].geometry;
              const feature = {
                type: "Feature",
                properties: { driverId },
                geometry: routeGeometry,
              };
              driverFullRouteFeatures.push(feature);
            }
          } catch (error) {
            console.error(
              `Error fetching full route for driver ${driverId}:`,
              error
            );
          }
        }
      );

      // Per-assignment routes and driver-to-pickup lines (as before)
      const assignmentPromises = assignment.map(async (assign) => {
        const { driver, passenger } = assign;
        const origin = `${driver.currentLng ?? 0},${driver.currentLat ?? 0}`;
        const pickup = `${passenger.pickupLng ?? 0},${passenger.pickupLat ?? 0}`;
        const dropoff = `${passenger.dropoffLng ?? 0},${passenger.dropoffLat ?? 0}`;

        // Add driver-to-pickup path as a simple LineString
        const driverToPickupLine = {
          type: "Feature",
          properties: { assignmentId: String(assign.id) },
          geometry: {
            type: "LineString",
            coordinates: [
              [driver.currentLng ?? 0, driver.currentLat ?? 0],
              [passenger.pickupLng ?? 0, passenger.pickupLat ?? 0],
            ],
          },
        };
        driverToPickupFeatures.push(driverToPickupLine);

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${pickup};${dropoff}?geometries=geojson&access_token=${
          import.meta.env.VITE_MAPBOX_API_KEY
        }`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.error(
              `Error fetching route for assignment ${assign.id}: ${response.statusText}`
            );
            return;
          }
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const routeGeometry = data.routes[0].geometry;
            const feature = {
              type: "Feature",
              properties: { assignmentId: String(assign.id) },
              geometry: routeGeometry,
            };
            assignmentRouteFeatures.push(feature);
          }
        } catch (error) {
          console.error(
            `Error fetching route for assignment ${assign.id}:`,
            error
          );
        }
      });

      await Promise.all([...driverRoutePromises, ...assignmentPromises]);
      setAssignmentRoutes(
        new Map([
          [
            "all",
            {
              type: "FeatureCollection",
              features: assignmentRouteFeatures,
            },
          ],
        ])
      );
      setDriverToPickupRoutes(
        new Map([
          [
            "all",
            {
              type: "FeatureCollection",
              features: driverToPickupFeatures,
            },
          ],
        ])
      );
      setDriverFullRoutes(
        new Map([
          [
            "all",
            {
              type: "FeatureCollection",
              features: driverFullRouteFeatures,
            },
          ],
        ])
      );
    };

    fetchRoutes().catch((error) => {
      console.error("Error calculating routes:", error);
      setMapError("Failed to calculate routes. Please refresh the page.");
    });
  }, [assignment]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#F59E0B";
      case "EN_ROUTE_TO_PICKUP":
        return "#0891B2";
      case "AT_PICKUP":
        return "#10B981";
      case "EN_ROUTE_TO_DROPOFF":
        return "#4F46E5";
      case "COMPLETED":
        return "#6B7280";
      default:
        return "#DB2777";
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "ASSIGNED":
        return "bg-purple-100 text-purple-800";
      case "EN_ROUTE_TO_PICKUP":
        return "bg-cyan-100 text-cyan-800";
      case "AT_PICKUP":
        return "bg-emerald-100 text-emerald-800";
      case "EN_ROUTE_TO_DROPOFF":
        return "bg-indigo-100 text-indigo-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-pink-100 text-pink-800";
    }
  };

  type MarkerIconProps = {
    type: "driver" | "pickup" | "dropoff" | string;
    color?: string;
    isActive: boolean;
  };

  const MarkerIcon = ({
    type,
    color,
    isActive,
  }: MarkerIconProps) => {
    const size = isActive ? "h-10 w-10" : "h-8 w-8";
    const baseClasses = `transition-all duration-300 ease-in-out transform ${
      isActive ? "scale-110 drop-shadow-lg" : ""
    }`;

    if (type === "driver") {
      return (
        <div className={`${baseClasses} bg-white rounded-full p-1.5 flex items-center justify-center border-2`} 
             style={{ borderColor: color || "#4F46E5" }}>
          <Car
            className={`${isActive ? "h-6 w-6" : "h-5 w-5"}`}
            style={{
              color: color || "#4F46E5",
            }}
          />
        </div>
      );
    }
    
    const iconColor = type === "pickup" ? "#10B981" : "#EF4444";
    const bgColor = type === "pickup" ? "bg-green-100" : "bg-red-100";
    
    return (
      <div className={`${baseClasses} ${bgColor} rounded-full p-1.5 flex items-center justify-center border-2`}
           style={{ borderColor: iconColor }}>
        <MapPin
          className={`${isActive ? "h-6 w-6" : "h-5 w-5"}`}
          style={{ color: iconColor }}
        />
      </div>
    );
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ");
  };

  if (mapError) {
    return (
      <div className="p-6 bg-red-50 text-red-800 rounded-lg shadow-md border border-red-200 flex items-center">
        <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
        <div>
          <h3 className="font-bold">Map Error</h3>
          <p>{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <MapIcon className="h-7 w-7" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Live Assignment Dashboard</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full">
              <CheckCircle className="h-4 w-4" />
              <span>Total: {totalAssignments}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full">
              <Car className="h-4 w-4" />
              <span>Drivers: {driverGroups.size}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full">
              <User className="h-4 w-4" />
              <span>Visible: {visibleDriverEntries.reduce((s, [, list]) => s + list.length, 0)}</span>
            </div>
          </div>
        </div>
        
        {/* Controls Section */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-full p-1.5">
              <Filter className="h-4 w-4" />
            </div>
            <div className="relative z-20 flex-1">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-56 bg-white text-gray-900 shadow-sm border-0">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border shadow-lg">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="EN_ROUTE_TO_PICKUP">En Route to Pickup</SelectItem>
                  <SelectItem value="AT_PICKUP">At Pickup</SelectItem>
                  <SelectItem value="EN_ROUTE_TO_DROPOFF">En Route to Dropoff</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white/10 rounded-full p-1.5">
              <Search className="h-4 w-4" />
            </div>
            <div className="relative w-full">
              <input
                placeholder="Search passenger or driver…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white rounded-md px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none border-0 focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-full p-1.5">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="bg-white text-gray-900 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none border-0"
            />
            <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50 font-medium" onClick={handleBatchAssign}>
              Assign All
            </Button>
            <AssignReservesForm scheduledDate={date} />
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="flex justify-between items-center gap-4 flex-wrap mb-4 bg-white rounded-xl p-3 shadow-md">
        <div className="flex items-center gap-1">
          <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-full">
            <Layers className="h-4 w-4" />
          </div>
          <span className="font-medium ml-1">Map Layers:</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <label className="flex items-center gap-2 hover:text-indigo-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showFullRoutes} 
              onChange={(e) => setShowFullRoutes(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">
              <Route className="h-3.5 w-3.5" />
              Driver routes
            </span>
          </label>
          <label className="flex items-center gap-2 hover:text-indigo-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showAssignmentRoutes} 
              onChange={(e) => setShowAssignmentRoutes(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">
              <Route className="h-3.5 w-3.5" />
              Assignment routes
            </span>
          </label>
          <label className="flex items-center gap-2 hover:text-indigo-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showDriverToPickup} 
              onChange={(e) => setShowDriverToPickup(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="flex items-center gap-1">
              <Route className="h-3.5 w-3.5" />
              Driver → Pickup
            </span>
          </label>
        </div>
        
        {isMobileView && (
          <Button 
            variant="outline" 
            className="ml-auto" 
            onClick={() => setShowDetailPanel(!showDetailPanel)}
          >
            {showDetailPanel ? "Hide Details" : "Show Details"}
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column for Assignment Details */}
        {(!isMobileView || showDetailPanel) && (
          <div className="lg:col-span-5 max-h-[75vh] overflow-y-auto pr-2 space-y-4">
            {isLoading && (
              <div className="text-center p-10 bg-white rounded-xl shadow-md">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading assignments...</p>
              </div>
            )}
            {!isLoading && totalAssignments === 0 && (
              <div className="text-center p-10 bg-white rounded-xl shadow-md">
                <MapPin className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                <p className="text-gray-500 text-lg">No active assignments found.</p>
                <p className="text-gray-400 text-sm mt-2">Try changing your filters or date selection.</p>
              </div>
            )}

            {visibleDriverEntries.map(
              ([driverId, driverAssignments]) => {
                const driver = driverAssignments[0].driver;
                return (
                  <div
                    key={driverId}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition hover:shadow-lg"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {(driver.firstName || driver.name || "")} {(driver.lastName || "")}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/25 backdrop-blur-sm"
                          >
                            {formatStatus(driver?.status || "")}
                          </span>
                        </div>
                        <div className="ml-auto text-sm bg-white/15 px-2 py-1 rounded-full">
                          {driverAssignments.length} assignment{driverAssignments.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 divide-y divide-gray-100">
                      {driverAssignments.map((assign) => (
                        <div
                          key={assign.id}
                          className={`p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-50 ${
                            activeAssignmentId === assign.id
                              ? "bg-indigo-50 shadow-sm border-l-4 border-indigo-500"
                              : ""
                          }`}
                          onClick={() =>
                            setActiveAssignmentId(
                              activeAssignmentId === String(assign.id) ? null : String(assign.id)
                            )
                          }
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-black">
                                  {assign?.passenger?.name}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClasses(assign?.status)}`}
                                >
                                  {formatStatus(assign?.status || "")}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-start gap-1">
                                  <MapPin className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium text-green-600">Pickup:</span>{" "}
                                    {`${
                                      assign.passenger.pickupStreetNumber || ""
                                    } ${assign.passenger.pickupStreet || ""}, ${
                                      assign.passenger.pickupCity || ""
                                    }`.trim() || "No address provided"}
                                  </div>
                                </div>
                                <div className="flex items-start gap-1">
                                  <MapPin className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium text-red-600">Dropoff:</span>{" "}
                                    {`${
                                      assign.passenger.dropoffStreetNumber || ""
                                    } ${assign.passenger.dropoffStreet || ""}, ${
                                      assign.passenger.dropoffCity || ""
                                    }`.trim() || "No address provided"}
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                    <Clock className="h-3 w-3 text-indigo-600" />
                                    <span className="text-gray-700">Pickup: </span>
                                    <span className="font-medium">
                                      {dayjs.utc(assign.estimatedPickupTime).format("HH:mm")} UTC
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                    <Clock className="h-3 w-3 text-indigo-600" />
                                    <span className="text-gray-700">Dropoff: </span>
                                    <span className="font-medium">
                                      {dayjs.utc(assign.estimatedDropoffTime).format("HH:mm")} UTC
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                                    <MapPin className="h-3 w-3 text-indigo-600" />
                                    <span className="text-gray-700">Distance: </span>
                                    <span className="font-medium">
                                      {assign.distanceToPickupKm?.toFixed(1)} km
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                onClick={() => openReassignForPassenger(String(assign?.passenger?.id))}
                              >
                                Reassign
                              </Button>
                            </div>
                          </div>

                          {reassignPassengerId === String(assign?.passenger?.id) && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 space-y-2 shadow-sm">
                              <div className="text-xs text-gray-600">Select a new driver</div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={selectedDriverId || undefined}
                                  onValueChange={(val) => dispatch(setSelectedDriver(val))}
                                >
                                  <SelectTrigger className="w-56 bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500">
                                    <SelectValue placeholder={reassignLoading ? "Loading drivers..." : "Choose driver"} />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white z-50 border border-gray-200 shadow-md">
                                    {(rankedDrivers || []).map((d: any) => (
                                      <SelectItem key={d.id} value={d.id} className="text-black">
                                        Driver {d.id} ({d.status})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                                  disabled={!selectedDriverId || reassignLoading}
                                  onClick={() => confirmReassign(String(assign?.passenger?.id))}
                                >
                                  {reassignLoading ? "Assigning..." : "Confirm"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-gray-600 hover:text-gray-800"
                                  onClick={() => setReassignPassengerId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* Right Column for the Map */}
        <div className={`${isMobileView && showDetailPanel ? 'hidden' : ''} ${showDetailPanel || !isMobileView ? 'lg:col-span-7' : 'lg:col-span-12'} rounded-xl overflow-hidden shadow-xl h-[75vh] w-full relative bg-white`}>
          <ErrorBoundary>
            <MapGL
              initialViewState={viewport}
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_API_KEY}
              onMove={(evt) => setViewport(evt.viewState)}
              ref={mapRef}
              mapStyle="mapbox://styles/mapbox/streets-v11"
            projection={{ name: "globe" }}
              style={{ width: "100%", height: "100%" }}
            >
              <div className="absolute top-2 left-2 z-10">
                <NavigationControl position="top-left" />
              </div>
              {assignment && (
                <>
                  {/* Active passenger pickup -> dropoff road route */}
                  {activePickupDropoffRoute && (
                    <MapboxSource id="active-pickup-dropoff" type="geojson" data={activePickupDropoffRoute}>
                      <Layer
                        id="active-pickup-dropoff-layer"
                        type="line"
                        paint={{
                          "line-color": "#16a34a",
                          "line-width": 6,
                          "line-opacity": 0.85,
                        }}
                      />
                    </MapboxSource>
                  )}
                  {/* Draw all drivers' full routes as a colored line (hide when active selection) */}
                  {!activeAssignmentId && showFullRoutes && driverFullRoutes.get("all") && (
                    <MapboxSource
                      id="driver-full-routes"
                      type="geojson"
                      data={driverFullRoutes.get("all")}
                    >
                      <Layer
                        id="driver-full-routes-layer"
                        type="line"
                        paint={{
                          "line-color": [
                            "match",
                            ["get", "driverId"],
                            ...driverColorPairs,
                            "#888",
                          ],
                          "line-width": 6,
                          "line-opacity": 0.7,
                        }}
                      />
                    </MapboxSource>
                  )}
                  {/* Draw all assignment routes */}
                  {showAssignmentRoutes && assignmentRoutes.get("all") && (
                    <MapboxSource
                      id="assignment-routes"
                      type="geojson"
                      data={assignmentRoutes.get("all")}
                    >
                      <Layer
                        id="assignment-routes-layer"
                        type="line"
                        filter={activeAssignmentId ? ["==", ["get", "assignmentId"], String(activeAssignmentId)] : undefined}
                        paint={{
                          "line-color": "#4F46E5",
                          "line-width": 4,
                          "line-opacity": 0.5,
                        }}
                      />
                    </MapboxSource>
                  )}
                  {/* Draw all driver-to-pickup lines */}
                  {showDriverToPickup && driverToPickupRoutes.get("all") && (
                    <MapboxSource
                      id="driver-to-pickup-lines"
                      type="geojson"
                      data={driverToPickupRoutes.get("all")}
                    >
                      <Layer
                        id="driver-to-pickup-lines-layer"
                        type="line"
                        filter={activeAssignmentId ? ["==", ["get", "assignmentId"], String(activeAssignmentId)] : undefined}
                        paint={{
                          "line-color": "#888",
                          "line-width": 3,
                          "line-dasharray": [2, 2],
                          "line-opacity": 0.7,
                        }}
                      />
                    </MapboxSource>
                  )}

                  {(activeAssignmentId ? assignment.filter((a:any) => String(a.id) === String(activeAssignmentId)) : assignment).map((assign) => {
                    const { driver, passenger } = assign;
                    const color = getStatusColor(String(assign.status ?? ""));
                    const isActive = activeAssignmentId === String(assign.id);

                    return (
                      <React.Fragment key={assign.id}>
                        {/* Driver Marker (dynamic origin if active) */}
                        <Marker
                          longitude={isActive && activeDriverOrigin ? activeDriverOrigin[0] : (driver.currentLng ?? 0)}
                          latitude={isActive && activeDriverOrigin ? activeDriverOrigin[1] : (driver.currentLat ?? 0)}
                          anchor="center"
                           onClick={() => setActiveAssignmentId(String(assign.id))}
                        >
                          <div
                            className="transition transform hover:scale-105"
                            onMouseEnter={() =>
                              setActiveMarker({
                                type: "driver",
                                lat: (driver.currentLat ?? 0),
                                lng: (driver.currentLng ?? 0),
                                driverName: (driver.name || `${driver.firstName ?? ""} ${driver.lastName ?? ""}`),
                                passengerName: (passenger.name ?? ""),
                                status: driver.status,
                                assignmentId: String(assign.id),
                              })
                            }
                            onMouseLeave={() => setActiveMarker(null)}
                          >
                            <MarkerIcon
                              type="driver"
                              isActive={isActive}
                              color={color}
                            />
                          </div>
                        </Marker>

                        {/* Pickup Marker */}
                        <Marker
                          longitude={passenger.pickupLng ?? 0}
                          latitude={passenger.pickupLat ?? 0}
                          anchor="center"
                           onClick={() => setActiveAssignmentId(String(assign.id))}
                        >
                          <div
                            className="transition transform hover:scale-105"
                            onMouseEnter={() =>
                              setActiveMarker({
                                type: "pickup",
                                lat: (passenger.pickupLat ?? 0),
                                lng: (passenger.pickupLng ?? 0),
                                driverName: (driver.name || `${driver.firstName ?? ""} ${driver.lastName ?? ""}`),
                                passengerName: (passenger.name ?? ""),
                                address: `${
                                  passenger.pickupStreetNumber || ""
                                } ${passenger.pickupStreet || ""}, ${
                                  passenger.pickupCity || ""
                                }`.trim(),
                                time: assign.estimatedPickupTime,
                                assignmentId: String(assign.id),
                              })
                            }
                            onMouseLeave={() => setActiveMarker(null)}
                          >
                            <MarkerIcon type="pickup" isActive={isActive} />
                          </div>
                        </Marker>

                        {/* Dropoff Marker */}
                        <Marker
                          longitude={passenger.dropoffLng ?? 0}
                          latitude={passenger.dropoffLat ?? 0}
                          anchor="center"
                           onClick={() => setActiveAssignmentId(String(assign.id))}
                        >
                          <div
                            className="transition transform hover:scale-105"
                            onMouseEnter={() =>
                              setActiveMarker({
                                type: "dropoff",
                                lat: (passenger.dropoffLat ?? 0),
                                lng: (passenger.dropoffLng ?? 0),
                                driverName: (driver.name || `${driver.firstName ?? ""} ${driver.lastName ?? ""}`),
                                passengerName: (passenger.name ?? ""),
                                address: `${
                                  passenger.dropoffStreetNumber || ""
                                } ${passenger.dropoffStreet || ""}, ${
                                  passenger.dropoffCity || ""
                                }`.trim(),
                                time: assign.estimatedDropoffTime,
                                assignmentId: String(assign.id),
                              })
                            }
                            onMouseLeave={() => setActiveMarker(null)}
                          >
                            <MarkerIcon type="dropoff" isActive={isActive} />
                          </div>
                        </Marker>
                      </React.Fragment>
                    );
                  })}
                </>
              )}

              {/* Info Popup */}
              {activeMarker && (
                <Popup
                  longitude={activeMarker.lng}
                  latitude={activeMarker.lat}
                  onClose={() => setActiveMarker(null)}
                  closeOnClick={false}
                  anchor="bottom"
                  offset={40}
                  className="z-50"
                >
                  <div className="p-3 font-sans max-w-xs bg-white rounded-lg shadow-lg border-t-4 border-indigo-500">
                    <h4 className="font-bold text-md mb-2 text-gray-800 flex items-center gap-2">
                      {activeMarker.type === "driver" && (
                        <>
                          <Car className="h-5 w-5 text-indigo-600" />
                          Driver Location
                        </>
                      )}
                      {activeMarker.type === "pickup" && (
                        <>
                          <MapPin className="h-5 w-5 text-green-600" />
                          Pickup Location
                        </>
                      )}
                      {activeMarker.type === "dropoff" && (
                        <>
                          <MapPin className="h-5 w-5 text-red-600" />
                          Dropoff Location
                        </>
                      )}
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                        <User size={16} className="text-gray-600" />
                        <span className="text-gray-800 font-medium">
                          {activeMarker.passengerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                        <Car size={16} className="text-gray-600" />
                        <span className="text-gray-800">
                          {activeMarker.driverName}
                        </span>
                      </div>

                      {activeMarker.address && (
                        <div className="flex items-start gap-2 bg-gray-50 p-2 rounded-md">
                          <MapPin size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-800">{activeMarker.address}</span>
                        </div>
                      )}

                      {activeMarker.time && (
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                          <Clock size={16} className="text-gray-600" />
                          <span className="text-gray-800">
                            {dayjs.utc(activeMarker.time).format("HH:mm")} UTC
                          </span>
                        </div>
                      )}

                      {activeMarker.status && (
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activeMarker.status === "EN_ROUTE_TO_PICKUP"
                                ? "bg-blue-100 text-blue-800"
                                : activeMarker.status === "AVAILABLE"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {formatStatus(activeMarker.status)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              )}
              
              {/* Map Legend */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 text-xs space-y-2 border border-gray-200">
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span>Map Legend</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-6 h-2 rounded-full" style={{ background: "#4F46E5" }} />
                    <span className="text-gray-700">Assignment route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-6 h-2 rounded-full border-t border-b border-dashed border-gray-500" style={{ background: "#888" }} />
                    <span className="text-gray-700">Driver → Pickup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {routeColors.slice(0, 3).map((color, i) => (
                        <span key={i} className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
                      ))}
                    </div>
                    <span className="text-gray-700">Driver routes</span>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-1 rounded-full border-2 border-blue-500 flex items-center justify-center">
                      <Car className="h-3 w-3 text-blue-500" />
                    </div>
                    <span className="text-gray-700">Driver</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-green-500" />
                    </div>
                    <span className="text-gray-700">Pickup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-1 rounded-full border-2 border-red-500 flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-red-500" />
                    </div>
                    <span className="text-gray-700">Dropoff</span>
                  </div>
                </div>
              </div>
            </MapGL>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Assignments;