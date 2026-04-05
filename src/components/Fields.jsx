import { ErrorMessage, Field } from "formik";
import React, { useState, useRef, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useField } from "formik";

export const FormField = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <Field
      {...props}
      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f6845] outline-none placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
    />
    <ErrorMessage
      name={props.name}
      component="div"
      className="text-red-500 text-xs mt-1"
    />
  </div>
);

export const TextArea = ({ label, ...props }) => (
  <div className="col-span-2">
    <label className="text-sm font-medium">{label}</label>
    <Field
      as="textarea"
      {...props}
      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[90px] focus:ring-2 focus:ring-[#0f6845] placeholder:text-gray-400"
    />
    <ErrorMessage
      name={props.name}
      component="div"
      className="text-red-500 text-xs mt-1"
    />
  </div>
);

export const SelectField = ({ label, children, ...props }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <Field
      as="select"
      {...props}
      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f6845] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
    >
      {children}
    </Field>
    <ErrorMessage
      name={props.name}
      component="div"
      className="text-red-500 text-xs mt-1"
    />
  </div>
);



export const HybridSelect = ({ label, name, options }) => (
  <Field name={name}>
    {({ field, form }) => (
      <div>
        <label className="text-sm font-medium">{label}</label>

        <input
          list={`${name}-list`}
          value={field.value}
          onChange={(e) => form.setFieldValue(name, e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f6845] placeholder:text-gray-400"
          placeholder={`Select or type ${label}`}
        />

        <datalist id={`${name}-list`}>
          {options.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>

        <ErrorMessage
          name={name}
          component="div"
          className="text-red-500 text-xs mt-1"
        />
      </div>
    )}
  </Field>
);






const TagsDropdown = ({ name, label, options }) => (
  <Field name={name}>
    {({ field, form }) => {
      const [input, setInput] = useState("");
      const [open, setOpen] = useState(false);
      const wrapperRef = useRef(null);

      const tags = field.value || [];

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

      const addTag = (tag) => {
        if (!tags.includes(tag)) {
          form.setFieldValue(name, [...tags, tag]);
        }
        setInput("");
        setOpen(false);
      };

      const removeTag = (tag) => {
        form.setFieldValue(
          name,
          tags.filter((t) => t !== tag)
        );
      };

      const filteredOptions = options.filter(
        (opt) =>
          opt.toLowerCase().includes(input.toLowerCase()) &&
          !tags.includes(opt)
      );

      return (
        <div ref={wrapperRef} className="col-span-2 relative">
          <label className="text-sm font-medium">{label}</label>

          {/* Selected tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-[#F3E8FF] text-[#0f6845] px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Input */}
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                e.preventDefault();
                addTag(input.trim());
              }
            }}
            placeholder="Select or add tag"
            className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f6845] placeholder:text-gray-400"
          />

          {/* Dropdown */}
          {open && filteredOptions.length > 0 && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1 max-h-40 overflow-y-auto">
              {filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => addTag(opt)}
                  className="px-3 py-2 cursor-pointer hover:bg-[#F3E8FF]"
                >
                  {opt}
                </div>
              ))}
            </div>
          )}

          {/* Add custom tag */}
          {input && !options.includes(input) && (
            <button
              type="button"
              onClick={() => addTag(input)}
              className="mt-2 text-sm text-[#0f6845] font-medium"
            >
              + Add “{input}”
            </button>
          )}
        </div>
      );
    }}
  </Field>
);

export default TagsDropdown;






export const ProgramTagsDropdown = ({ name, label, options }) => (
  <Field name={name}>
    {({ field, form }) => {
      const [input, setInput] = useState("");
      const [open, setOpen] = useState(false);
      const wrapperRef = useRef(null);

      // Ensure tags is always an array
      const tags = Array.isArray(field.value) ? field.value : [];


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

      const addTag = (tag) => {
        if (!tags.includes(tag)) {
          form.setFieldValue(name, [...tags, tag]);
        }
        setInput("");
        setOpen(false);
      };

      const removeTag = (tag) => {
        form.setFieldValue(
          name,
          tags.filter((t) => t !== tag)
        );
      };

      const filteredOptions = options.filter(
        (opt) =>
          opt.toLowerCase().includes(input.toLowerCase()) &&
          !tags.includes(opt)
      );

      return (
        <div ref={wrapperRef} className="col-span-2 relative">
          <label className="text-sm font-medium">{label}</label>

          {/* Selected tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-[#F3E8FF] text-[#0f6845] px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Input */}
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                e.preventDefault();
                addTag(input.trim());
              }
            }}
            placeholder="Select or add tag"
            className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f6845] placeholder:text-gray-400"
          />

          {/* Dropdown */}
          {open && filteredOptions.length > 0 && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1 max-h-40 overflow-y-auto">
              {filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => addTag(opt)}
                  className="px-3 py-2 cursor-pointer hover:bg-[#F3E8FF]"
                >
                  {opt}
                </div>
              ))}
            </div>
          )}

          {/* Add custom tag */}
          {input && !options.includes(input) && (
            <button
              type="button"
              onClick={() => addTag(input)}
              className="mt-2 text-sm text-[#0f6845] font-medium"
            >
              + Add “{input}”
            </button>
          )}
        </div>
      );
    }}
  </Field>
);









export const ImageUploadWithPreview = ({ label, existingImage, ...props }) => {
  const [field, meta, helpers] = useField(props);
  const [preview, setPreview] = useState(null);

  // 🔹 Show existing image on edit
  useEffect(() => {
    if (existingImage) {
      setPreview(existingImage);
    }
  }, [existingImage]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    helpers.setValue(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="col-span-2 flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>

      {/* ✅ IMAGE PREVIEW */}
      {preview && (
        <div className="w-full flex justify-center">
          <img
            src={preview}
            alt="Preview"
            className="h-48 w-auto rounded-lg border border-gray-300 object-cover"
          />
        </div>
      )}

      {/* File input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-3 py-2"
      />

      {meta.touched && meta.error && (
        <span className="text-red-500 text-sm">{meta.error}</span>
      )}
    </div>
  );
};
