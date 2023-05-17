import React, { useRef, useState } from "react";
//styling
import "./Map.css";
//icons
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";
//renders map component
import {
  UilLocationArrow,
  UilDirections,
  UilTimes,
  UilTruck,
  UilLuggageCart,
  UilCircle,
  UilMapPin,
} from "@iconscout/react-unicons";

/* props: {filters, vendors} from App.js */
export default function Map({ vendors, filters, handleFiltersState }) {
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState("");
  //Center lat lng is san francisco
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const originRef = useRef();
  const destinationRef = useRef();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  if (!isLoaded) {
    return <div>Loading</div>;
  }

  const vendorIds = Object.keys(vendors);
  let iconMarker = new window.google.maps.MarkerImage(
    "https://images.emojiterra.com/twitter/v13.1/512px/1f535.png",
    null /* size is determined at runtime */,
    null /* origin is 0,0 */,
    null /* anchor is bottom center of the scaled image */,
    new window.google.maps.Size(12, 12)
  );

  function toggleFilterData(key) {
    const filterData = { ...filters, [key]: !filters[key] };
    handleFiltersState(filterData);
    // setSelectedMarker(null);
  }

  /********************** handle marker infoview functions **********************/
  function handleMarkerMouseOver(vendorId) {
    setSelectedMarker(vendors[vendorId]);
    console.log(vendors[vendorId]);
  }
  function handleMarkerCloseClick() {
    setSelectedMarker(null);
  }

  /********************* handle map and direction functions *********************/
  function locateUser() {
    if (!navigator.geolocation) {
      return;
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log("position", position);
        const { longitude, latitude } = position.coords;
        const latLng = { lat: latitude, lng: longitude };
        originRef.current.value = `${latitude}, ${longitude}`;
        setCenter(latLng);
        setCurrentLocation(latLng);
      });
    }
  }

  // CALCULATE ROUTE AND DISPLAY DISTANCE & DURATION
  async function calculateRoute(location) {
    destinationRef.current.value = location || "";
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

  //clears route, starting point, destination, distance, and duration
  function clearRoute() {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    destinationRef.current.value = "";
  }

  return (
    <div>
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: "100vw", height: "100vh" }}
        onLoad={(map) => setMap(map)}
        options={{
          zoomControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        }}
      >
        {/********************** controls for directions **********************/}
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
          <div>
            Distance: {distance}
            <UilDirections className="icons" onClick={calculateRoute} />
            <br />
            Duration: {duration}
          </div>
        </div>
        {/*************************** FILTER BUTTONS ***************************/}
        <div className="container filter">
          <UilLuggageCart
            className={`filter-icons ${filters.pushCart ? "active" : ""}`}
            onClick={() => toggleFilterData("pushCart")}
          />
          <UilTruck
            className={`filter-icons ${filters.truck ? "active" : ""}`}
            onClick={() => toggleFilterData("truck")}
          />
          <UilCircle
            className={`green filter-icons ${filters.approved ? "active" : ""}`}
            onClick={() => toggleFilterData("approved")}
          />
          <UilCircle
            className={`yellow filter-icons ${
              filters.requested ? "active" : ""
            }`}
            onClick={() => toggleFilterData("requested")}
          />
          <UilCircle
            className={`red filter-icons ${filters.expired ? "active" : ""}`}
            onClick={() => toggleFilterData("expired")}
          />
        </div>
        {/*************************** GET DIRECTIONS ***************************/}
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}

        {/***************************** MARKERS *********************************/}
        {currentLocation && (
          <Marker position={currentLocation} icon={iconMarker} />
        )}
        {/* clusterer component must pass down clusterer as a prop to marker */}
        <MarkerClusterer
          gridSize={40}
          minimumClusterSize={2}
          options={{ maxZoom: 100 }}
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

        {/******************* INFORMATION WINDOW FOR MARKERS *******************/}
        {selectedMarker && (
          <InfoWindow
            key={selectedMarker.objectid}
            position={{
              lat: Number(selectedMarker.latitude),
              lng: Number(selectedMarker.longitude),
            }}
            onCloseClick={handleMarkerCloseClick}
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
              {selectedMarker.address && (
                <p>
                  <b>Addres: </b>
                  {selectedMarker.address}
                </p>
              )}
              <UilDirections
                className="infoview-directions"
                onClick={() =>
                  calculateRoute(
                    `${selectedMarker.latitude}, ${selectedMarker.longitude}` ||
                      selectedMarker.address
                  )
                }
              />
            </>
          </InfoWindow>
        )}
        {/* displayin markers or directions */}
      </GoogleMap>
    </div>
  );
}
