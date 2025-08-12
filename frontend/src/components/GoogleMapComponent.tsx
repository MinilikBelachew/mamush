import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useSelector } from "react-redux";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const routeColors = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
];

const MapComponent = () => {
  const { passengers } = useSelector((state) => state.passengers);
  const { driver } = useSelector((state) => state.driver);

  const [directions, setDirections] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  const center = driver?.[0]
    ? { lat: driver[0].currentLat, lng: driver[0].currentLng }
    : { lat: 39.7392, lng: -104.9903 };

  const handleMapLoad = (map) => {
    setMapInstance(map);
  };

  useEffect(() => {
    if (!isApiLoaded || !mapInstance || !passengers?.length) return;

    const directionsService = new window.google.maps.DirectionsService();

    const requests = passengers.map((passenger, index) => {
      const request = {
        origin: { lat: passenger.pickupLat, lng: passenger.pickupLng },
        destination: { lat: passenger.dropoffLat, lng: passenger.dropoffLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      return new Promise((resolve) => {
        directionsService.route(request, (result, status) => {
          if (status === "OK") {
            resolve({
              ...result,
              request: {
                ...request,
                polylineOptions: {
                  strokeColor: routeColors[index % routeColors.length],
                  strokeWeight: 4,
                  strokeOpacity: 0.8,
                },
              },
            });
          } else {
            console.error(
              `Directions request failed for passenger ${passenger.id}`,
              status
            );
            resolve(null);
          }
        });
      });
    });

    Promise.all(requests).then((results) => {
      setDirections(results.filter(Boolean));
    });
  }, [isApiLoaded, mapInstance, passengers]);

  // Helper function to safely create Size object
  const createSize = (
    width: number,
    height: number
  ): google.maps.Size | undefined => {
    return isApiLoaded && window.google?.maps
      ? new window.google.maps.Size(width, height)
      : undefined;
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_API_KEY}
      onLoad={() => setIsApiLoaded(true)}
    >
      {isApiLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={11}
          onLoad={handleMapLoad}
          options={{
            streetViewControl: true,
            fullscreenControl: true,
            mapTypeControl: true,
            zoomControl: true,
            mapTypeControlOptions: {
              style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
              position: window.google.maps.ControlPosition.TOP_RIGHT,
            },
            fullscreenControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_TOP,
            },
            streetViewControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
            },
            zoomControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_CENTER,
            },
          }}
        >
          {driver?.map((driver) => (
            <Marker
              key={driver.id}
              position={{
                lat: driver.currentLat,
                lng: driver.currentLng,
              }}
              label="D"
              title={`Driver: ${driver.name}`}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: createSize(32, 32),
              }}
              clickable={true}
            />
          ))}

          {passengers?.map((passenger) => (
            <React.Fragment key={passenger.id}>
              <Marker
                position={{
                  lat: passenger.pickupLat,
                  lng: passenger.pickupLng,
                }}
                label="P"
                title={`Pickup: ${passenger.name}`}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                  ...(createSize(32, 32) && { scaledSize: createSize(32, 32) }),
                }}
                clickable={true}
              />
              <Marker
                position={{
                  lat: passenger.dropoffLat,
                  lng: passenger.dropoffLng,
                }}
                label="D"
                title={`Dropoff: ${passenger.name}`}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  ...(createSize(32, 32) && { scaledSize: createSize(32, 32) }),
                }}
                clickable={true}
              />
            </React.Fragment>
          ))}

          {directions.map((dir, index) => (
            <DirectionsRenderer
              key={index}
              directions={dir}
              routeIndex={0}
              options={{
                polylineOptions: {
                  strokeColor: routeColors[index % routeColors.length],
                  strokeWeight: 4,
                  strokeOpacity: 0.8,
                },
                suppressMarkers: true,
              }}
            />
          ))}
        </GoogleMap>
      )}
    </LoadScript>
  );
};

export default MapComponent;
