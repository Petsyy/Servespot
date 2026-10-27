import React from "react";
import { useLocationCascade } from "@/shared/hooks/useLocationCascade";

export default function LocationCascadingSelector({
  region = "",
  regionCode = "",
  province = "",
  provinceCode = "",
  city = "",
  cityCode = "",
  barangay = "",
  barangayCode = "",
  editable = true,
  onChange,
  disabled = false,
}) {
  const {
    regions,
    provinces,
    cities,
    barangays,
    loadingRegions,
    loadingProvinces,
    loadingCities,
    loadingBarangays,
  } = useLocationCascade({
    region,
    regionCode,
    province,
    provinceCode,
    city,
    cityCode,
    enabled: editable,
  });

  // Handlers
  const handleRegionSelect = (e) => {
    const val = e.target.value;
    const found = regions.find((r) => r.name === val || r.code === val);
    const code = found?.code || "";
    const name = found?.name || val;

    if (code === "130000000" || code === "1300000000") {
      onChange?.({
        region: name,
        regionCode: code,
        province: "Metro Manila",
        provinceCode: "NCR-PROV",
        city: "",
        cityCode: "",
        barangay: "",
        barangayCode: "",
      });
    } else {
      onChange?.({
        region: name,
        regionCode: code,
        province: "",
        provinceCode: "",
        city: "",
        cityCode: "",
        barangay: "",
        barangayCode: "",
      });
    }
  };

  const handleProvinceSelect = (e) => {
    const val = e.target.value;
    const found = provinces.find((p) => p.name === val || p.code === val);
    const code = found?.code || "";
    const name = found?.name || val;

    onChange?.({
      province: name,
      provinceCode: code,
      city: "",
      cityCode: "",
      barangay: "",
      barangayCode: "",
    });
  };

  const handleCitySelect = (e) => {
    const val = e.target.value;
    const found = cities.find((c) => c.name === val || c.code === val);
    const code = found?.code || "";
    const name = found?.name || val;

    onChange?.({
      city: name,
      cityCode: code,
      barangay: "",
      barangayCode: "",
    });
  };

  const handleBarangaySelect = (e) => {
    const val = e.target.value;
    const found = barangays.find((b) => b.name === val || b.code === val);
    const code = found?.code || "";
    const name = found?.name || val;

    onChange?.({
      barangay: name,
      barangayCode: code,
    });
  };

  if (!editable) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Region
          </label>
          <div className="w-full h-10 px-3 flex items-center rounded-lg bg-gray-50 border border-green-200 text-gray-800 text-sm">
            {region || <span className="text-gray-400">Not set</span>}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Province
          </label>
          <div className="w-full h-10 px-3 flex items-center rounded-lg bg-gray-50 border border-green-200 text-gray-800 text-sm">
            {province || <span className="text-gray-400">Not set</span>}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            City / Municipality
          </label>
          <div className="w-full h-10 px-3 flex items-center rounded-lg bg-gray-50 border border-green-200 text-gray-800 text-sm">
            {city || <span className="text-gray-400">Not set</span>}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Barangay
          </label>
          <div className="w-full h-10 px-3 flex items-center rounded-lg bg-gray-50 border border-green-200 text-gray-800 text-sm">
            {barangay || <span className="text-gray-400">Not set</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Region */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Region</label>
        <select
          value={region || ""}
          onChange={handleRegionSelect}
          disabled={disabled || loadingRegions}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm transition disabled:opacity-50"
        >
          <option value="">{loadingRegions ? "Loading regions..." : "Select Region..."}</option>
          {regions.map((r) => (
            <option key={r.code} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Province */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Province</label>
        <select
          value={province || ""}
          onChange={handleProvinceSelect}
          disabled={disabled || !region || loadingProvinces}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm transition disabled:opacity-50"
        >
          <option value="">{loadingProvinces ? "Loading provinces..." : "Select Province..."}</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">City / Municipality</label>
        <select
          value={city || ""}
          onChange={handleCitySelect}
          disabled={disabled || !province || loadingCities}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm transition disabled:opacity-50"
        >
          <option value="">{loadingCities ? "Loading cities..." : "Select City..."}</option>
          {cities.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Barangay */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Barangay</label>
        <select
          value={barangay || ""}
          onChange={handleBarangaySelect}
          disabled={disabled || !city || loadingBarangays}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm transition disabled:opacity-50"
        >
          <option value="">{loadingBarangays ? "Loading barangays..." : "Select Barangay..."}</option>
          {barangays.map((b) => (
            <option key={b.code} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
