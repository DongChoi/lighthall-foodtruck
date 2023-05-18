import React, { useRef, useState } from "react";
//styling
import "./Map.css";
//icons
import { Tooltip } from "react-tooltip";
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
} from "@iconscout/react-unicons";
import StepByStepDirections from "./StepByStepDirections";

/* props: {filters, vendors} from App.js */
export default function Map({ vendors, filters, handleFiltersState }) {
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const [directionsResponse, setDirectionsResponse] = useState("");
  //Center lat lng is san francisco
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const originRef = useRef();
  const destinationRef = useRef();
  const [stepByStepDirections, setStepByStepDirections] = useState(null);
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
  //toggles filter object and passes in a new object to parent level to easily update state
  function toggleFilterData(key) {
    const filterData = { ...filters, [key]: !filters[key] };
    handleFiltersState(filterData);
    // setSelectedMarker(null);
  }

  /********************** handle marker infoview functions **********************/
  function handleMarkerMouseOver(vendorId) {
    setSelectedMarker(vendors[vendorId]);
    // console.log(vendors[vendorId]);
  }
  function handleMarkerCloseClick() {
    setSelectedMarker(null);
  }

  /********************* handle map and direction functions *********************/
  function locateUser() {
    console.log("locating user");
    if (!navigator.geolocation) {
      return;
    } else {
      try {
        navigator.geolocation.getCurrentPosition((position) => {
          // console.log("position", position);
          const { longitude, latitude } = position.coords;
          const latLng = { lat: latitude, lng: longitude };
          originRef.current.value = `${latitude}, ${longitude}`;
          setCenter(latLng);
          setCurrentLocation(latLng);
        });
      } catch (e) {
        console.error(e);
        alert(
          "Something went wrong while trying to locate you, please check your permissions or browser compatibility!"
        );
      }
    }
    console.log("located user");
  }

  //handleDirectionClick
  function handleInfoViewDirections(destination) {
    destinationRef.current.value = destination;
    calculateRoute(travelMode);
  }

  function handleTravelModeChange(newTravelMode) {
    console.log("am i being called ");
    setTravelMode(newTravelMode);
    calculateRoute(newTravelMode);
  }

  // CALCULATE ROUTE AND DISPLAY DISTANCE & DURATION
  async function calculateRoute(travelMode) {
    if (originRef.current.value === "" || destinationRef.current.value === "") {
      return;
    } else {
      try {
        // eslint-disable-next-line no-undef
        const directionsService = new google.maps.DirectionsService();
        const results = await directionsService.route({
          origin: originRef.current.value,
          destination: destinationRef.current.value,
          travelMode: travelMode,
        });
        setDirectionsResponse(results);
        // eslint-disable-next-line no-undef
        setDistance(results.routes[0].legs[0].distance.text);
        // eslint-disable-next-line no-undef
        setDuration(results.routes[0].legs[0].duration.text);
        console.log(results.routes[0].legs[0].steps);
        setStepByStepDirections(results.routes[0].legs[0].steps);
      } catch (e) {
        console.error(e);
        alert(
          "Pleaes make sure starting point and destinations are valid locations :)"
        );
      }
    }
  }

  //clears route, destination, distance, and duration
  function clearRoute() {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    setStepByStepDirections(null);
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
            <UilLocationArrow
              data-tooltip-content="Get current location"
              data-tooltip-place="right"
              className="tool-tip icons"
              onClick={locateUser}
            />
          </div>
          <div className="container-inner">
            <Autocomplete>
              <input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
              />
            </Autocomplete>
            <UilTimes
              data-tooltip-content="Clear destination"
              data-tooltip-place="right"
              className="tool-tip icons"
              onClick={clearRoute}
            />
          </div>
          <div className="display-container">
            Distance: {distance}
            <UilDirections
              data-tooltip-content="Get Directions"
              data-tooltip-place="right"
              className="tool-tip icons"
              onClick={calculateRoute}
            />
            <br />
            Duration: {duration}
          </div>
        </div>
        {/*************************** FILTER BUTTONS ***************************/}
        <div className="container filter">
          <UilLuggageCart
            data-tooltip-content="Filter by push cart vendors"
            data-tooltip-place="left"
            className={`tool-tip filter-icons ${
              filters.pushCart ? "active" : ""
            }`}
            onClick={() => toggleFilterData("pushCart")}
          />
          <UilTruck
            data-tooltip-content="Filter by truck vendors"
            data-tooltip-place="left"
            className={`tool-tip filter-icons ${filters.truck ? "active" : ""}`}
            onClick={() => toggleFilterData("truck")}
          />
          <UilCircle
            data-tooltip-content="Filter by approved permit vendors"
            data-tooltip-place="left"
            className={`tool-tip green filter-icons ${
              filters.approved ? "active" : ""
            }`}
            onClick={() => toggleFilterData("approved")}
          />
          <UilCircle
            data-tooltip-content="Filter by requested permit vendors"
            data-tooltip-place="left"
            className={`tool-tip yellow filter-icons ${
              filters.requested ? "active" : ""
            }`}
            onClick={() => toggleFilterData("requested")}
          />
          <UilCircle
            data-tooltip-content="Filter by expired permit vendors"
            data-tooltip-place="left"
            className={`tool-tip red filter-icons ${
              filters.expired ? "active" : ""
            }`}
            onClick={() => toggleFilterData("expired")}
          />
          <Tooltip anchorSelect=".tool-tip" />
        </div>
        {/*************************** GET DIRECTIONS ***************************/}
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}

        {/***************************** MARKERS *********************************/}
        {currentLocation && (
          <Marker
            data-tooltip-content="current location"
            data-tooltip-place="top"
            className="tool-tip"
            position={currentLocation}
            icon={iconMarker}
          />
        )}
        {/* clusterer component must pass down clusterer as a prop to marker */}
        <MarkerClusterer
          gridSize={40}
          minimumClusterSize={2}
          options={{ maxZoom: 100 }}
        >
          {(clusterer) => {
            return vendorIds.map((vendorId, index) => {
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
                  : "Permit Expired or Suspended"}
              </p>
              {selectedMarker.address && (
                <p>
                  <b>Addres: </b>
                  {selectedMarker.address}
                </p>
              )}
              <UilDirections
                className="infoview-directions"
                onClick={() => {
                  const destination =
                    selectedMarker.latitude && selectedMarker.longitude
                      ? `${selectedMarker.latitude}, ${selectedMarker.longitude}`
                      : selectedMarker.address;
                  handleInfoViewDirections(destination);
                }}
              />
            </>
          </InfoWindow>
        )}

        {/* displayin markers or directions */}
        {stepByStepDirections ? (
          <StepByStepDirections
            handleTravelModeChange={handleTravelModeChange}
            travelMode={travelMode}
            stepByStepDirections={stepByStepDirections}
            clearRoute={clearRoute}
          />
        ) : (
          ""
        )}
      </GoogleMap>
    </div>
  );
}
