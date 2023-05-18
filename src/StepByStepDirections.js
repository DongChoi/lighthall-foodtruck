import React from "react";
import "./StepByStepDirections.css";
import parse from "html-react-parser";

import {
  UilBusAlt,
  UilCarSideview,
  UilMasterCard,
  UilUser,
  UilTimes,
} from "@iconscout/react-unicons";
export default function ({
  stepByStepDirections,
  handleTravelModeChange,
  travelMode,
  clearRoute,
}) {
  function handleClearDirections() {
    clearRoute();
  }
  function handleTravelModeClick(travelMethod) {
    handleTravelModeChange(travelMethod);
  }
  return (
    //step by step directions
    <div className="directions-container">
      <div className="travel-mode-buttons-container">
        <UilCarSideview
          className={`tool-tip travel-icons ${
            travelMode === "DRIVING" ? "active" : ""
          }`}
          onClick={() => handleTravelModeClick("DRIVING")}
        />
        <UilUser
          className={`tool-tip travel-icons ${
            travelMode === "WALKING" ? "active" : ""
          }`}
          onClick={() => handleTravelModeClick("WALKING")}
        />
        <UilMasterCard
          className={`tool-tip travel-icons ${
            travelMode === "BICYCLING" ? "active" : ""
          }`}
          onClick={() => handleTravelModeClick("BICYCLING")}
        />
        <UilBusAlt
          className={`tool-tip travel-icons ${
            travelMode === "TRANSIT" ? "active" : ""
          }`}
          onClick={() => handleTravelModeClick("TRANSIT")}
        />
        <UilTimes
          className="tool-tip travel-icons cancel"
          onClick={handleClearDirections}
        />
      </div>
      Directions:{" "}
      {stepByStepDirections.map((step, index) => {
        return (
          <div>
            {parse(
              `${index + 1}. ${step.instructions} for ${step.distance.text}`
            )}
          </div>
        );
      })}
    </div>
  );
}
