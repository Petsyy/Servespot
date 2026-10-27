import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocationService } from "@/shared/services/location.service";
import { queryKeys } from "@/shared/services/queryKeys";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Custom TanStack Query hook managing reactive, cascading Philippine location data.
 * Handles automatic code derivation from names, NCR Metro Manila special cases,
 * and eliminates manual useEffect waterfalls.
 */
export function useLocationCascade({
  region = "",
  regionCode = "",
  province = "",
  provinceCode = "",
  city = "",
  cityCode = "",
  enabled = true,
} = {}) {
  // 1. Fetch Regions (shared, long-lived cache)
  const regionsQuery = useQuery({
    queryKey: queryKeys.locations.regions,
    queryFn: () => LocationService.getRegions(),
    enabled,
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
  });

  const regions = useMemo(
    () => regionsQuery.data || [],
    [regionsQuery.data]
  );

  // Derive effective region code (handles either code or name)
  const effectiveRegionCode = useMemo(() => {
    if (regionCode) return regionCode;
    if (!region || !regions.length) return "";
    const matched = regions.find(
      (r) => r.name?.toLowerCase() === region.toLowerCase() || r.code === region
    );
    return matched?.code || "";
  }, [region, regionCode, regions]);

  // Special Region: NCR (National Capital Region: code 130000000 / 1300000000)
  const isNCR =
    effectiveRegionCode === "130000000" ||
    effectiveRegionCode === "1300000000" ||
    provinceCode === "NCR-PROV" ||
    province?.toLowerCase() === "metro manila";

  // 2. Fetch Provinces (dependent on regionCode, disabled if NCR)
  const canFetchProvinces = enabled && Boolean(effectiveRegionCode);

  const provincesQuery = useQuery({
    queryKey: queryKeys.locations.provinces(effectiveRegionCode),
    queryFn: () => LocationService.getProvinces(effectiveRegionCode),
    enabled: canFetchProvinces,
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
  });

  const provinces = useMemo(
    () => provincesQuery.data || [],
    [provincesQuery.data]
  );

  // Derive effective province code
  const effectiveProvinceCode = useMemo(() => {
    if (isNCR) return "NCR-PROV";
    if (provinceCode) return provinceCode;
    if (!province || !provinces.length) return "";
    const matched = provinces.find(
      (p) => p.name?.toLowerCase() === province.toLowerCase() || p.code === province
    );
    return matched?.code || "";
  }, [province, provinceCode, provinces, isNCR]);

  // 3. Fetch Cities (dependent on effectiveRegionCode and province/NCR)
  const canFetchCities =
    enabled &&
    Boolean(effectiveRegionCode) &&
    (isNCR || Boolean(effectiveProvinceCode));

  const citiesQuery = useQuery({
    queryKey: queryKeys.locations.cities(
      effectiveRegionCode,
      isNCR ? "NCR-PROV" : effectiveProvinceCode
    ),
    queryFn: () =>
      LocationService.getCities(
        effectiveRegionCode,
        isNCR ? "NCR-PROV" : effectiveProvinceCode
      ),
    enabled: canFetchCities,
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
  });

  const cities = useMemo(
    () => citiesQuery.data || [],
    [citiesQuery.data]
  );

  // Derive effective city code
  const effectiveCityCode = useMemo(() => {
    if (cityCode) return cityCode;
    if (!city || !cities.length) return "";
    const matched = cities.find(
      (c) => c.name?.toLowerCase() === city.toLowerCase() || c.code === city
    );
    return matched?.code || "";
  }, [city, cityCode, cities]);

  // 4. Fetch Barangays (dependent on effectiveCityCode)
  const canFetchBarangays = enabled && Boolean(effectiveCityCode);

  const barangaysQuery = useQuery({
    queryKey: queryKeys.locations.barangays(effectiveCityCode),
    queryFn: () => LocationService.getBarangays(effectiveCityCode),
    enabled: canFetchBarangays,
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
  });

  const barangays = useMemo(
    () => barangaysQuery.data || [],
    [barangaysQuery.data]
  );

  return {
    regions,
    provinces,
    cities,
    barangays,
    effectiveRegionCode,
    effectiveProvinceCode,
    effectiveCityCode,
    isNCR,
    loadingRegions: regionsQuery.isLoading,
    loadingProvinces: provincesQuery.isLoading,
    loadingCities: citiesQuery.isLoading,
    loadingBarangays: barangaysQuery.isLoading,
    isFetching:
      regionsQuery.isFetching ||
      provincesQuery.isFetching ||
      citiesQuery.isFetching ||
      barangaysQuery.isFetching,
  };
}

export default useLocationCascade;

