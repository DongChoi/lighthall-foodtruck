import "./App.css";
import Map from "./Map";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const initialFilterData = {
    truck: true,
    pushCart: true,
    approved: true,
    requested: false,
    expired: false,
    searchQuery: "",
  };

  const [vendors, setVendors] = useState(null);
  const [filters, setFilters] = useState(initialFilterData);
  const [vendorsForMap, setVendorsForMap] = useState({});
  //future dev
  //const [filterbytype, setfilter] = useState("foodtruck?")
  function filterVendorData(vendor) {
    const {
      applicant = "",
      approved = "",
      status = "",
      fooditems = "",
      latitude = "",
      longitude = "",
      expirationdate = "",
      facilitytype = "",
      address = "",
    } = vendor;
    return {
      applicant,
      approved,
      facilitytype,
      status,
      fooditems: fooditems.split(":"),
      latitude,
      longitude,
      address,
      expirationdate,
    };
  }

  function handleFiltersState(filterData) {
    try {
      setFilters(filterData);
      const newVendorsForMap = spreadVendorData(filterData);
      setVendorsForMap(newVendorsForMap);
    } catch (e) {
      console.error(
        "something went wrong during the filtering vendors process",
        e
      );
    }
  }

  /* accepts filterData and spreads and returns vendor data */
  function spreadVendorData(filterData) {
    const filteredListVendors = [];

    if (filterData.truck) {
      filterData.approved && filteredListVendors.push(vendors.truck.approved);
      filterData.requested && filteredListVendors.push(vendors.truck.requested);
      filterData.expired && filteredListVendors.push(vendors.truck.expired);
    }

    if (filterData.pushCart) {
      filterData.approved &&
        filteredListVendors.push(vendors.pushCart.approved);
      filterData.requested &&
        filteredListVendors.push(vendors.pushCart.requested);
      filterData.expired && filteredListVendors.push(vendors.pushCart.expired);
    }
    if (filterData.searchQuery) {
      const mergedVendors = filteredListVendors.reduce((acc, vendors) => {
        for (let key in vendors) {
          const vendor = vendors[key];
          console.log(vendor);
          console.log(filterData.searchQuery);
          if (
            vendor.fooditems.some((item) =>
              item.toLowerCase().includes(filterData.searchQuery)
            )
          ) {
            acc[key] = vendor;
          }
        }
        return acc;
      }, {});

      return mergedVendors;
    } else {
      const mergedVendors = filteredListVendors.reduce((acc, vendors) => {
        return Object.assign(acc, { ...vendors });
      }, {});

      return mergedVendors;
    }
  }

  /**
   * divides vendors into x categories.
   * @param {Array<Object>} data - The input array of objects.
   * @returns {Object} - An object containing three arrays: approved, expired, and requested.
   */
  function restructureAndSortVendorsByCategory(vendors, today) {
    const truck = { approved: {}, requested: {}, expired: {} };
    const pushCart = { approved: {}, requested: {}, expired: {} };
    for (let vendor of vendors) {
      if (vendor.facilitytype == "Truck") {
        if (vendor.status == "EXPIRED" || vendor.status == "SUSPEND") {
          truck.expired[vendor.objectid] = filterVendorData(vendor);
        } else if (vendor.status == "REQUESTED") {
          truck.requested[vendor.objectid] = filterVendorData(vendor);
        } else {
          truck.approved[vendor.objectid] = filterVendorData(vendor);
        }
      } else if (vendor.facilitytype == "Push Cart") {
        if (vendor.status == "EXPIRED" || vendor.status == "SUSPEND") {
          pushCart.expired[vendor.objectid] = filterVendorData(vendor);
        } else if (vendor.status == "REQUESTED") {
          pushCart.requested[vendor.objectid] = filterVendorData(vendor);
        } else {
          pushCart.approved[vendor.objectid] = filterVendorData(vendor);
        }
      }
    }
    const restructuredVendors = { pushCart, truck };

    return restructuredVendors;
  }
  //updates once per day to see api update as api does not seem to update often.
  useEffect(() => {
    async function fetchVendorsOnMount() {
      const today = new Date();
      const formattedDate = today.toLocaleDateString("en-US");

      const vendorsFromLS = JSON.parse(localStorage.getItem("vendors"));
      try {
        if (
          !vendorsFromLS ||
          vendorsFromLS.date !== formattedDate ||
          typeof vendors !== "object"
        ) {
          const resp = await axios.get(
            "https://data.sfgov.org/resource/rqzj-sfat.json"
          );
          const restructuredVendors = restructureAndSortVendorsByCategory(
            resp.data,
            today
          );
          const vendorsAndDateForLS = {
            data: restructuredVendors,
            date: formattedDate,
          };
          localStorage.setItem("vendors", JSON.stringify(vendorsAndDateForLS));
          setVendors(restructuredVendors);
          setVendorsForMap({
            ...restructuredVendors.truck.approved,
            ...restructuredVendors.pushCart.approved,
          });
        } else {
          setVendors(vendorsFromLS.data);
          setVendorsForMap({
            ...vendorsFromLS.data.truck.approved,
            ...vendorsFromLS.data.pushCart.approved,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchVendorsOnMount();
  }, []);

  return (
    <div className="App">
      <Map
        className="Map"
        handleFiltersState={handleFiltersState}
        vendors={vendorsForMap}
        filters={filters}
      ></Map>
    </div>
  );
}

export default App;
