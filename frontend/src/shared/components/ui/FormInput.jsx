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
  rightElement,
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
    ? "border-red-400 focus:ring-4 focus:ring-red-400/15 focus:border-red-500 bg-red-50/20"
    : "border-gray-200 hover:border-gray-300 focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-600 bg-white";

  return (
    <div className={`flex flex-col space-y-1.5 relative ${className}`}>
      {label && (
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          ref={ref}
          name={name}
          className={`border rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none ${borderClass}`}
          value={value}
          onChange={handleStandardChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />
      ) : type === "radio" ? (
        <div className={`flex flex-wrap gap-4 rounded-xl border px-3.5 py-2.5 ${error ? "border-red-400" : "border-gray-200"}`}>
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
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
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
            className={`border rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none w-full ${borderClass}`}
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
              className={`border rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none w-full ${borderClass} ${loading ? 'bg-gray-100' : ''}`}
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder || "Type to search..."}
              disabled={disabled || loading}
            />
            {isOpen && filteredOptions.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto mt-1"
              >
                {filteredOptions.map((opt, i) => {
                  const optionValue = opt.value || opt;
                  const optionLabel = opt.label || opt;
                  return (
                    <div
                      key={i}
                      className="px-3.5 py-2.5 hover:bg-emerald-50 hover:text-emerald-900 cursor-pointer text-sm transition-colors"
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
          className={`border rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none ${borderClass}`}
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
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            name={name}
            type={type}
            className={`border rounded-xl ${icon ? "pl-10" : "px-3.5"} ${
              rightElement ? "pr-11" : "pr-3.5"
            } py-2.5 text-sm transition-all focus:outline-none w-full ${borderClass}`}
            value={value}
            onChange={handleStandardChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            {...rest}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
      )}

      {error && (
        <span className="text-xs text-red-500 font-medium animate-fadeInUp">
          {error}
        </span>
      )}
    </div>
  );
});

FormInput.displayName = "FormInput";
export default FormInput;
