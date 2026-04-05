import React, { useState, useRef, useEffect } from "react";
import { useField } from "formik";

const LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Malayalam",
  "Kannada",
];

const LanguageMultiSelect = ({ name, label = "Language" }) => {
  const [field, meta, helpers] = useField(name);
  const rawValue = field.value;
  const value = Array.isArray(rawValue) ? rawValue : [];

  const { setValue } = helpers;

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = (lang) => {
    if (value.includes(lang)) {
      setValue(value.filter((l) => l !== lang));
    } else {
      setValue([...value, lang]);
    }
  };

  const removeLanguage = (lang) => {
    setValue(value.filter((l) => l !== lang));
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block mb-1 font-medium">{label}</label>

      {/* Selected Languages */}
      <div
        className="min-h-[44px] border  border-gray-300  rounded-lg p-2 flex flex-wrap gap-2 cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        {value.length === 0 && (
          <span className="text-gray-400">Select languages</span>
        )}

        {value.map((lang) => (
          <span
            key={lang}
            className="bg-[#0f6845] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {lang}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeLanguage(lang);
              }}
              className="font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 w-full mt-1 bg-white border  border-gray-300  rounded-lg shadow max-h-48 overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <div
              key={lang}
              onClick={() => toggleLanguage(lang)}
              className={`px-4 py-2 cursor-pointer flex justify-between hover:bg-gray-100 ${value.includes(lang) ? "bg-gray-100 font-medium" : ""
                }`}
            >
              {lang}
              {value.includes(lang) && "✔"}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
    </div>
  );
};

export default LanguageMultiSelect;
