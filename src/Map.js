import React, { useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { clear } from "@testing-library/user-event/dist/clear";

export default function Map() {
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResposne, setDirectionsResponse] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef();
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  const locations = ["safeway", "my location"];
  const center = { lat: 37.7749, lng: -122.4194 };
  //   const bounds = new window.google.maps.LatLngBounds(center);
  if (!isLoaded) {
    return <div>Loading</div>;
  }

  async function calculateRoute() {
    if (originRef.current.value === "" || destinationRef.current.value === "") {
      return;
    } else {
      // eslint-disable-next-line no-undef
      const directionsService = new google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(results);
      // eslint-disable-next-line no-undef
      setDistance(results.routes[0].legs[0].distance.text);
      // eslint-disable-next-line no-undef
      setDuration(results.routes[0].legs[0].duration.text);
    }
  }
  function clearRoute() {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
  }

  return (
    <div>
      <Autocomplete>
        <input type="text" placeholder="Start" ref={originRef} />
      </Autocomplete>
      <Autocomplete>
        <input type="text" placeholder="Destination" ref={destinationRef} />
      </Autocomplete>
      <button onClick={calculateRoute}>calculateRoute</button>
      <button onClick={clearRoute}>x</button>
      <button onClick={() => map.panTo(center)}>Locate Me</button>
      <p>Distance: {distance}</p>
      <p>Duration: {duration}</p>
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: "100vw", height: "100vh" }}
        onLoad={(map) => setMap(map)}
      >
        {directionsResposne && (
          <DirectionsRenderer directions={directionsResposne} />
        )}
        {/* this is where we want to populate many markers */}
        <Marker className="Marker" position={center} />
        this is where map should be
        {/* displayin markers or directions */}
      </GoogleMap>
    </div>
  );
}
