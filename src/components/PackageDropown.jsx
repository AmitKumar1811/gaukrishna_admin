import React, { useState, useRef, useEffect } from "react";
import { Field } from "formik";

const PackageDropdown = ({
  name,
  label,
  options = [],
  labelKey = "name",
  valueKey = "id",
}) => (
  <Field name={name}>
    {({ field, form }) => {
      const [search, setSearch] = useState("");
      const [open, setOpen] = useState(false);
      const wrapperRef = useRef(null);

      const selected = Array.isArray(field.value) ? field.value : [];


      // 🔹 Close dropdown on outside click
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (
            wrapperRef.current &&
            !wrapperRef.current.contains(event.target)
          ) {
            setOpen(false);
          }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      const addItem = (item) => {
        if (!selected.includes(item[valueKey])) {
          form.setFieldValue(name, [...selected, item[valueKey]]);
        }
        setSearch("");
        setOpen(false);
      };

      const removeItem = (id) => {
        form.setFieldValue(
          name,
          selected.filter((v) => v !== id)
        );
      };

      const filteredOptions = options.filter(
        (opt) =>
          opt?.[labelKey]?.toLowerCase().includes(search.toLowerCase()) &&
          !selected.includes(opt?.[valueKey])
      );

      return (
        <div ref={wrapperRef} className="col-span-2 relative">
          <label className="text-sm font-medium">{label}</label>

          {/* Selected chips */}
          <div className="flex flex-wrap gap-2 mt-2">
            {selected.map((id) => {
              const item = options.find(
                (o) => o[valueKey] === id
              );
              return (
                <span
                  key={id}
                  className="bg-[#F3E8FF] text-brand-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {item?.[labelKey] || id}
                  <button
                    type="button"
                    onClick={() => removeItem(id)}
                    className="font-bold"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Select from list"
            className="mt-2 w-full border  border-gray-300  rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600"
          />

          {/* Dropdown */}
          {open && filteredOptions.length > 0 && (
            <div className="absolute z-10 bg-white border  border-gray-300  rounded-lg shadow-lg w-full mt-1 max-h-40 overflow-y-auto">
              {filteredOptions.map((opt) => (
                <div
                  key={opt[valueKey]}
                  onClick={() => addItem(opt)}
                  className="px-3 py-2 cursor-pointer hover:bg-[#F3E8FF]"
                >
                  {opt[labelKey]}
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {open && filteredOptions.length === 0 && (
            <div className="absolute z-10 bg-white border rounded-lg w-full mt-1 px-3 py-2 text-sm text-gray-500">
              No results
            </div>
          )}
        </div>
      );
    }}
  </Field>
);

export default PackageDropdown;
