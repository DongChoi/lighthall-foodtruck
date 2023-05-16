import React, { useEffect, useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { clear } from "@testing-library/user-event/dist/clear";
//renders map component

export default function Map() {
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState("");
  //Center lat lng is san francisco
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  /*restructure markers into an object with the keys as objectIds since I am not
    removing out of view markers. still have to decide if I want to show all markers or not*/
  const [markers, setMarkers] = useState("");
  const originRef = useRef();
  const destinationRef = useRef();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  function locateUser() {
    if (!navigator.geolocation) {
      return;
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log("position", position);
        const { longitude, latitude } = position.coords;
        originRef.current.value = `${latitude}, ${longitude}`;
        setCenter({ lat: latitude, lng: longitude });
      });
    }
  }

  //   const bounds = new window.google.maps.LatLngBounds(center);
  if (!isLoaded) {
    return <div>Loading</div>;
  }

  // CALCULATE ROUTE AND DISPLAY DISTANCE & DURATION
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
      console.log(
        "origin Ref:",
        originRef,
        "\n destination Ref",
        destinationRef,
        "\n Map: ",
        GoogleMap
      );
    }
  }

  //
  function handleBoundsChanged() {
    if (!map) return;

    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    console.log("Northeast Lat/Lng:", ne.lat(), ne.lng());
    console.log("Southwest Lat/Lng:", sw.lat(), sw.lng());
    console.log("origin Ref", originRef);
    // Here, you can perform your query for available restaurants
    // using the latitude and longitude values of the northeast (ne) and southwest (sw) corners
    // and update your markers accordingly.
  }

  //clears route, starting point, destination, distance, and duration
  function clearRoute() {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
  }

  const markerOptions = {
    icon: {
      url: "marker-icon.png", // URL or path to your custom marker icon
      scaledSize: new window.google.maps.Size(32, 32),
    },
  };

  return (
    <div>
      <Autocomplete>
        <input type="text" placeholder="Start" ref={originRef} />
      </Autocomplete>
      <Autocomplete>
        <input type="text" placeholder="Destination" ref={destinationRef} />
      </Autocomplete>
      <button onClick={calculateRoute}>Calculate Route</button>
      <button onClick={clearRoute}>Clear Route</button>
      <button onClick={locateUser}>Locate Me</button>
      <p>Distance: {distance}</p>
      <p>Duration: {duration}</p>
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: "100vw", height: "100vh" }}
        onLoad={(map) => setMap(map)}
        onBoundsChanged={handleBoundsChanged}
      >
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}
        {/* this is where we want to populate many markers */}
        <Marker
          position={{ lat: 37.7749, lng: -122.4194 }}
          animation={window.google.maps.Animation.DROP}
          title="title"
          {...markerOptions}
        />
        {/* displayin markers or directions */}
      </GoogleMap>
    </div>
  );
}
