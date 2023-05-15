import React from "react";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";

export default function Map() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });
  const center = { lat: -6.236688, lng: 53.339688 };
  //   const bounds = new window.google.maps.LatLngBounds(center);
  if (!isLoaded) {
    return <div>Loading</div>;
  }
  return (
    <GoogleMap
      center={center}
      zoom={15}
      mapContainerStyle={{ width: "100%", height: "100%" }}
    >
      this is where map should be
      {/* displayin markers or directions */}
    </GoogleMap>
  );
}
