import React, { useEffect, useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";
import { clear } from "@testing-library/user-event/dist/clear";
//renders map component
import "./Map.css";
import {
  UilLocationArrow,
  UilDirections,
  UilTimes,
  UilTruck,
  UilLuggageCart,
  UilMegaphone,
} from "@iconscout/react-unicons";
export default function Map({ vendors }) {
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState("");
  //Center lat lng is san francisco
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  /*restructure markers into an object with the keys as objectIds since I am not
    removing out of view markers. still have to decide if I want to show all markers or not*/
  // const [markers, setMarkers] = useState("");
  const originRef = useRef();
  const destinationRef = useRef();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const vendorIds = Object.keys(vendors);

  function handleMarkerMouseOut() {
    setSelectedMarker(null);
  }

  function handleMarkerMouseOver(vendorId) {
    setSelectedMarker(vendors[vendorId]);
    console.log(vendors[vendorId]);
  }

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
    }
  }

  function handleBoundsChanged() {
    if (!map) return;

    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
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

  return (
    <div>
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: "100vw", height: "100vh" }}
        onLoad={(map) => setMap(map)}
        onBoundsChanged={handleBoundsChanged}
        options={{
          zoomControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        }}
      >
        <div className="container">
          <div className="container-inner">
            <Autocomplete>
              <input type="text" placeholder="Start" ref={originRef} />
            </Autocomplete>
            <UilLocationArrow className="icons" onClick={locateUser} />
          </div>
          <div className="container-inner">
            <Autocomplete>
              <input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
              />
            </Autocomplete>
            <UilTimes className="icons" onClick={clearRoute} />
          </div>
          <div className="container-inner">
            Distance: {distance}
            <UilDirections className="icons" onClick={calculateRoute} />
            <br />
            Duration: {duration}
          </div>
        </div>
        <div className="container filter">
          <UilLuggageCart />
          <UilTruck />
          <UilMegaphone />
        </div>
        {/* renders directions */}
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}

        {/* clusterer component must pass down clusterer as a prop to marker */}
        <MarkerClusterer
          gridSize={40}
          minimumClusterSize={2}
          options={{ maxZoom: 20 }}
        >
          {(clusterer) => {
            return vendorIds.map((vendorId) => {
              return (
                <Marker
                  onMouseOver={() => handleMarkerMouseOver(vendorId)}
                  key={vendors[vendorId].objectid}
                  position={{
                    lat: Number(vendors[vendorId].latitude),
                    lng: Number(vendors[vendorId].longitude),
                  }}
                  animation={window.google.maps.Animation.DROP}
                  // {...markerOptions}
                  // onMouseOut={handleMarkerMouseOut}
                  clusterer={clusterer}
                />
              );
            });
          }}
        </MarkerClusterer>
        {selectedMarker && (
          <InfoWindow
            key={selectedMarker.objectid}
            position={{
              lat: Number(selectedMarker.latitude),
              lng: Number(selectedMarker.longitude),
            }}
            onCloseClick={handleMarkerMouseOut}
          >
            <>
              <h3>
                {selectedMarker.applicant}{" "}
                {selectedMarker.facilitytype == "Truck" ? (
                  <UilTruck className="facility-icons" />
                ) : (
                  <UilLuggageCart className="facility-icons" />
                )}
              </h3>
              <p>
                <b>Menu: </b>
                {selectedMarker.fooditems}
              </p>
              <p>
                <b>Status: </b>
                {selectedMarker.status == "REQUESTED"
                  ? "Coming Soon!"
                  : selectedMarker.status == "APPROVED"
                  ? "Open"
                  : "Permit Expired"}
              </p>
            </>
          </InfoWindow>
        )}
        {/* displayin markers or directions */}
      </GoogleMap>
    </div>
  );
}
