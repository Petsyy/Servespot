import React, { useState, useRef, useEffect, useMemo, useCallback, forwardRef } from "react";

const FormInput = forwardRef(function FormInput({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  name,
  error,
  options = [],
  placeholder,
  accept,
  loading = false,
  disabled = false,
  multi = false,
  icon,
  className = "",
  ...rest
}, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const internalInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize filtered options to avoid recalculating on every render
  const filteredOptions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return options.slice(0, 50);
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return options.filter((opt) => {
      const optionText = (opt.label || opt.value || opt).toLowerCase();
      return optionText.includes(searchLower);
    }).slice(0, 100);
  }, [options, debouncedSearchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        internalInputRef.current &&
        !internalInputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection for custom dropdown
  const handleSelect = (selectedValue, selectedLabel) => {
    if (onChange) onChange(selectedValue);
    setSearchTerm(selectedLabel);
    setIsOpen(false);
  };

  // Handle input change with throttling for custom dropdown
  const handleInputChange = useCallback((e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    setIsOpen(true);
    if (!inputValue.trim() && onChange) {
      onChange("");
    }
  }, [onChange]);

  // Handle standard input change: supports both RHF (uncontrolled, passes event)
  // and legacy caller (controlled with value prop, passes e.target.value)
  const handleStandardChange = (e) => {
    if (!onChange) return;
    if (value !== undefined) {
      onChange(e.target.value);
    } else {
      onChange(e);
    }
  };

  const borderClass = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300 focus:ring-green-500 focus:border-green-500";

  return (
    <div className={`flex flex-col space-y-1 relative ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      {type === "textarea" ? (
        <textarea
          ref={ref}
          name={name}
          className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${borderClass}`}
          value={value}
          onChange={handleStandardChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />
      ) : type === "radio" ? (
        <div className={`flex flex-wrap gap-4 rounded-md border px-3 py-2 ${error ? "border-red-500" : "border-gray-300"}`}>
          {options.map((opt, i) => {
            const optionValue = opt.value || opt;
            const optionLabel = opt.label || opt;
            const inputId = `${label || name}-${optionValue}-${i}`.replace(/\s+/g, "-").toLowerCase();

            return (
              <label
                key={inputId}
                htmlFor={inputId}
                className={`flex items-center gap-2 text-sm ${
                  disabled ? "cursor-not-allowed text-gray-400" : "cursor-pointer text-gray-700"
                }`}
              >
                <input
                  ref={ref}
                  id={inputId}
                  type="radio"
                  name={name || label}
                  value={optionValue}
                  checked={value === optionValue}
                  onChange={() => onChange && onChange(optionValue)}
                  onBlur={onBlur}
                  disabled={disabled}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                  {...rest}
                />
                <span>{optionLabel}</span>
              </label>
            );
          })}
        </div>
      ) : type === "select" ? (
        multi ? (
          <select
            ref={ref}
            name={name}
            multiple
            className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 w-full ${borderClass}`}
            value={value || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              if (onChange) onChange(selected);
            }}
            onBlur={onBlur}
            disabled={disabled || loading}
            {...rest}
          >
            {options.map((opt, i) => {
              const optionValue = opt.value || opt;
              const optionLabel = opt.label || opt;
              return (
                <option key={i} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        ) : (
          <div className="relative">
            <input
              ref={internalInputRef}
              type="text"
              className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 w-full ${borderClass} ${loading ? 'bg-gray-100' : ''}`}
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
        )
      ) : type === "file" ? (
        <input
          ref={ref}
          name={name}
          type="file"
          accept={accept}
          className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${borderClass}`}
          onChange={(e) => {
            if (!onChange) return;
            if (value !== undefined) {
              onChange(e.target.files?.[0] || null);
            } else {
              onChange(e);
            }
          }}
          onBlur={onBlur}
          disabled={disabled}
          {...rest}
        />
      ) : (
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            name={name}
            type={type}
            className={`border rounded-md ${icon ? "pl-9 pr-3" : "px-3"} py-2 text-sm focus:outline-none focus:ring-2 w-full ${borderClass}`}
            value={value}
            onChange={handleStandardChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            {...rest}
          />
        </div>
      )}

      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
});

FormInput.displayName = "FormInput";
export default FormInput;
