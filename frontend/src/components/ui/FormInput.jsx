import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

export default function FormInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  options = [],
  placeholder,
  accept,
  loading = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize filtered options to avoid recalculating on every render
  const filteredOptions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return options.slice(0, 50); // Show first 50 options when no search
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return options.filter((opt) => {
      const optionText = (opt.label || opt.value || opt).toLowerCase();
      return optionText.includes(searchLower);
    }).slice(0, 100); // Limit to 100 results for performance
  }, [options, debouncedSearchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (selectedValue, selectedLabel) => {
    onChange(selectedValue);
    setSearchTerm(selectedLabel);
    setIsOpen(false);
  };

  // Handle input change with throttling
  const handleInputChange = useCallback((e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    setIsOpen(true);
    // If input is cleared, clear the value
    if (!inputValue.trim()) {
      onChange("");
    }
  }, [onChange]);

  return (
    <div className="flex flex-col space-y-1 relative">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {type === "textarea" ? (
        <textarea
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : type === "select" ? (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full ${loading ? 'bg-gray-100' : ''}`}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder || "Type to search..."}
            disabled={disabled || loading}
          />
          {isOpen && filteredOptions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1"
            >
              {filteredOptions.map((opt, i) => {
                const optionValue = opt.value || opt;
                const optionLabel = opt.label || opt;
                return (
                  <div
                    key={i}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleSelect(optionValue, optionLabel)}
                  >
                    {optionLabel}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : type === "file" ? (
        <input
          type="file"
          accept={accept}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => onChange(e.target.files?.[0] || null )} // ✅ Fixed
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
