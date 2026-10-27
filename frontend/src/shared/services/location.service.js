import axios from "axios";

const BASE_URL = "https://psgc.gitlab.io/api";
const CACHE_PREFIX = "psgc_cache_";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const getCached = (key) => {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCached = (key, data) => {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (err) {
    console.warn("LocationService: cache write skipped (storage quota):", err);
  }
};

export const LocationService = {
  // Fetch all regions
  async getRegions() {
    const cached = getCached("regions");
    if (cached) return cached;

    const res = await axios.get(`${BASE_URL}/regions.json`);
    const formatted = res.data.map((r) => ({
      code: r.code || r.regionCode,
      name: r.regionName || r.name,
    }));
    setCached("regions", formatted);
    return formatted;
  },

  // Fetch provinces for a given region (handles NCR special case)
  async getProvinces(regionCode) {
    if (!regionCode) return [];

    // Special Region: NCR (National Capital Region) has no provinces
    if (regionCode === "130000000" || regionCode === "1300000000") {
      return [{ code: "NCR-PROV", name: "Metro Manila" }];
    }

    const cacheKey = `provinces_${regionCode}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await axios.get(`${BASE_URL}/regions/${regionCode}/provinces.json`);
    const formatted = res.data.map((p) => ({
      code: p.code || p.provinceCode,
      name: p.name || p.provinceName,
    }));

    // If an unexpected region has no provinces, fallback gracefully
    if (formatted.length === 0) {
      return [{ code: `${regionCode}-PROV`, name: "Default Province" }];
    }

    setCached(cacheKey, formatted);
    return formatted;
  },

  // Fetch cities/municipalities (handles NCR fetching directly from region)
  async getCities(regionCode, provinceCode) {
    if (!regionCode) return [];

    // If NCR, fetch cities directly from region endpoint
    if (
      regionCode === "130000000" ||
      regionCode === "1300000000" ||
      provinceCode === "NCR-PROV"
    ) {
      const cacheKey = `cities_ncr_${regionCode}`;
      const cached = getCached(cacheKey);
      if (cached) return cached;

      const res = await axios.get(
        `${BASE_URL}/regions/${regionCode}/cities-municipalities.json`
      );
      const formatted = res.data.map((c) => ({
        code: c.code || c.cityMunicipalityCode,
        name: c.name || c.cityMunicipalityName,
      }));
      setCached(cacheKey, formatted);
      return formatted;
    }

    if (!provinceCode) return [];

    const cacheKey = `cities_${provinceCode}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await axios.get(
      `${BASE_URL}/provinces/${provinceCode}/cities-municipalities.json`
    );
    const formatted = res.data.map((c) => ({
      code: c.code || c.cityMunicipalityCode,
      name: c.name || c.cityMunicipalityName,
    }));
    setCached(cacheKey, formatted);
    return formatted;
  },

  // Fetch barangays for a given city
  async getBarangays(cityCode) {
    if (!cityCode) return [];

    const cacheKey = `barangays_${cityCode}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await axios.get(
      `${BASE_URL}/cities-municipalities/${cityCode}/barangays.json`
    );
    const formatted = res.data.map((b) => ({
      code: b.code || b.barangayCode,
      name: b.name || b.barangayName,
    }));
    setCached(cacheKey, formatted);
    return formatted;
  },
};

export default LocationService;

