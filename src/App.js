import "./App.css";
import Map from "./Map";
import { useEffect, useState } from "react";
import axios from "axios";
function App() {
  const [vendors, setVendors] = useState({});
  function restructureVendorList(vendors) {
    const restructuredVendors = vendors.map((vendor) => {
      const {
        objectid = "",
        applicant = "",
        approved = "",
        status = "",
        fooditems = "",
        latitude = "",
        longitude = "",
        address = "",
        expirationdate = "",
        facilitytype = "",
      } = vendor;

      return {
        objectid,
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
    });
    return restructuredVendors;
  }

  useEffect(() => {
    async function fetchVendorsOnMount() {
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("en-US");
      const vendorsFromLS = JSON.parse(localStorage.getItem("vendors"));
      if (vendorsFromLS.date !== formattedDate || typeof vendors !== "object") {
        const resp = await axios.get(
          "https://data.sfgov.org/resource/rqzj-sfat.json"
        );
        const restructuredVendors = restructureVendorList(resp.data);
        const vendorsAndDateForLS = {
          data: restructuredVendors,
          date: formattedDate,
        };
        localStorage.setItem("vendors", JSON.stringify(vendorsAndDateForLS));
        setVendors(restructuredVendors.data);
      } else {
        setVendors(vendorsFromLS.data);
      }
    }
    fetchVendorsOnMount();
  }, []);

  return (
    <div className="App">
      <Map className="Map"></Map>
    </div>
  );
}

export default App;
