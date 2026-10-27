import { useState, useEffect, useCallback } from "react";
import LocationService from "@/shared/services/location.service";
import { toast } from "react-toastify";

export function useLocationSelector({ formData, updateField }) {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Initial load: Fetch regions
  useEffect(() => {
    let active = true;
    const loadRegions = async () => {
      setLoadingRegions(true);
      try {
        const list = await LocationService.getRegions();
        if (active) setRegions(list);
      } catch (err) {
        console.error("Failed to load regions:", err);
        toast.error("Failed to load regions. Please check your network.");
      } finally {
        if (active) setLoadingRegions(false);
      }
    };
    loadRegions();
    return () => {
      active = false;
    };
  }, []);

  // When Region changes
  const handleRegionChange = useCallback(
    async (regionCode) => {
      const selected = regions.find((r) => r.code === regionCode);
      const regionName = selected ? selected.name : "";

      updateField("region", regionName);
      updateField("regionCode", regionCode);

      // Reset child fields
      updateField("province", "");
      updateField("provinceCode", "");
      updateField("city", "");
      updateField("cityCode", "");
      updateField("barangay", "");
      updateField("barangayCode", "");

      setProvinces([]);
      setCities([]);
      setBarangays([]);

      if (!regionCode) return;

      setLoadingProvinces(true);
      try {
        const provList = await LocationService.getProvinces(regionCode);
        setProvinces(provList);

        // If NCR, auto-select province and immediately fetch cities
        if (regionCode === "130000000" || regionCode === "1300000000") {
          updateField("province", "Metro Manila");
          updateField("provinceCode", "NCR-PROV");
          setLoadingCities(true);
          const cityList = await LocationService.getCities(regionCode, "NCR-PROV");
          setCities(cityList);
          setLoadingCities(false);
        }
      } catch (err) {
        console.error("Failed to load provinces:", err);
        toast.error("Failed to load provinces.");
      } finally {
        setLoadingProvinces(false);
      }
    },
    [regions, updateField]
  );

  // When Province changes
  const handleProvinceChange = useCallback(
    async (provinceCode) => {
      const selected = provinces.find((p) => p.code === provinceCode);
      const provinceName = selected ? selected.name : "";

      updateField("province", provinceName);
      updateField("provinceCode", provinceCode);

      // Reset child fields
      updateField("city", "");
      updateField("cityCode", "");
      updateField("barangay", "");
      updateField("barangayCode", "");

      setCities([]);
      setBarangays([]);

      if (!provinceCode) return;

      setLoadingCities(true);
      try {
        const cityList = await LocationService.getCities(
          formData.regionCode,
          provinceCode
        );
        setCities(cityList);
      } catch (err) {
        console.error("Failed to load cities:", err);
        toast.error("Failed to load cities.");
      } finally {
        setLoadingCities(false);
      }
    },
    [provinces, formData.regionCode, updateField]
  );

  // When City changes
  const handleCityChange = useCallback(
    async (cityCode) => {
      const selected = cities.find((c) => c.code === cityCode);
      const cityName = selected ? selected.name : "";

      updateField("city", cityName);
      updateField("cityCode", cityCode);

      // Reset child fields
      updateField("barangay", "");
      updateField("barangayCode", "");

      setBarangays([]);

      if (!cityCode) return;

      setLoadingBarangays(true);
      try {
        const brgyList = await LocationService.getBarangays(cityCode);
        setBarangays(brgyList);
      } catch (err) {
        console.error("Failed to load barangays:", err);
        toast.error("Failed to load barangays.");
      } finally {
        setLoadingBarangays(false);
      }
    },
    [cities, updateField]
  );

  // When Barangay changes
  const handleBarangayChange = useCallback(
    (barangayCode) => {
      const selected = barangays.find((b) => b.code === barangayCode);
      const barangayName = selected ? selected.name : "";

      updateField("barangay", barangayName);
      updateField("barangayCode", barangayCode);
    },
    [barangays, updateField]
  );

  return {
    regions,
    provinces,
    cities,
    barangays,
    loadingRegions,
    loadingProvinces,
    loadingCities,
    loadingBarangays,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
  };
}

export default useLocationSelector;

