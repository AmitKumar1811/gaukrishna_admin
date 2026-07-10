import React, { useEffect, useState } from "react";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../Firebase";
import { FiImage, FiPlus, FiEdit2, FiX, FiCheck, FiUploadCloud } from "react-icons/fi";

const ModernEditor = ({ value, onChange }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-brand-400 transition-colors duration-300">
      <Editor
        apiKey='67wfwn36yoqbdfa5b9z2h0htonpl9fe1leq140x79yraniaz'
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height: 300,
          menubar: false,
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
            "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
            "insertdatetime", "media", "table", "help", "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
    </div>
  );
};

const SECTIONS = {
  about_us: { label: "About Us", collection: "aboutUs" },
  proceed_scan: { label: "Proceed to Scan", collection: "proceedToScan" },
  splash_content: { label: "Splash Content", collection: "splashContent" }
};

const DynamicContent = () => {
  const [activeTab, setActiveTab] = useState("about_us");
  const [loading, setLoading] = useState(true);
  const [contentData, setContentData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = {};

      // Fetch all sections in parallel
      await Promise.all(Object.keys(SECTIONS).map(async (key) => {
        const colName = SECTIONS[key].collection;
        const querySnapshot = await getDocs(collection(db, colName));
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          data[key] = { id: docSnap.id, ...docSnap.data() };
        } else {
          data[key] = null;
        }
      }));

      setContentData(data);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset editing mode when tab changes
  useEffect(() => {
    setIsEditing(false);
  }, [activeTab]);

  const handleSave = async (values, sectionKey) => {
    try {
      const section = SECTIONS[sectionKey];
      const existingData = contentData[sectionKey];

      const docId = existingData?.id || "config";
      const docRef = doc(db, section.collection, docId);

      const payload = { ...values, updatedAt: serverTimestamp() };

      for (const key of Object.keys(values)) {
        if (values[key] instanceof File) {
          const file = values[key];
          // Use aboutUs folder for permission workaround, but distinct prefix
          const storageRef = ref(storage, `aboutUs/${section.collection}_${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          payload[key] = url;
        }
      }

      await setDoc(docRef, payload, { merge: true });

      toast.success(`${section.label} updated successfully`);
      setIsEditing(false); // Switch back to preview
      fetchData(); // Refresh data

    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save changes");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
        <span className="text-sm text-slate-400 font-medium">Loading content...</span>
      </div>
    );
  }

  const currentData = contentData[activeTab];

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen animate-fade-in relative">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Dynamic Content</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage app content and screens</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-2 flex overflow-x-auto custom-scrollbar">
          {Object.keys(SECTIONS).map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-3 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer
                        ${activeTab === key ? "bg-brand-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              {SECTIONS[key].label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 sm:p-8">

          {/* View Mode: Preview */}
          {!isEditing && (
            <SectionPreview
              data={currentData}
              type={activeTab}
              onEdit={() => setIsEditing(true)}
            />
          )}

          {/* Edit Mode: Forms */}
          {isEditing && (
            <>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                <span>Edit {SECTIONS[activeTab].label}</span>
                <button onClick={() => setIsEditing(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 cursor-pointer">
                  <FiX className="w-5 h-5" />
                </button>
              </h3>

              {activeTab === 'about_us' && (
                <SectionForm
                  initialValues={{
                    title: currentData?.title || "",
                    description: currentData?.description || "",
                    image: currentData?.image?.url || currentData?.image || ""
                  }}
                  validationSchema={Yup.object({
                    title: Yup.string().required("Title is required"),
                    description: Yup.string().required("Description is required"),
                  })}
                  onSubmit={(values) => handleSave(values, 'about_us')}
                  onCancel={() => setIsEditing(false)}
                  fields={[
                    { name: "title", label: "Page Title", type: "text" },
                    { name: "description", label: "Content", type: "editor" },
                    { name: "image", label: "Banner Image", type: "image", preview: currentData?.image?.url || currentData?.image }
                  ]}
                />
              )}

              {activeTab === 'proceed_scan' && (
                <SectionForm
                  initialValues={{
                    text: currentData?.text || "",
                    image: currentData?.image || ""
                  }}
                  validationSchema={Yup.object({
                    text: Yup.string().required("Text is required"),
                  })}
                  onSubmit={(values) => handleSave(values, 'proceed_scan')}
                  onCancel={() => setIsEditing(false)}
                  fields={[
                    { name: "text", label: "Instruction Text", type: "editor" },
                    { name: "image", label: "Illustration Image", type: "image", preview: currentData?.image }
                  ]}
                />
              )}

              {activeTab === 'splash_content' && (
                <SectionForm
                  initialValues={{
                    splashImage: currentData?.splashImage || "",
                    appIcon: currentData?.appIcon || ""
                  }}
                  validationSchema={Yup.object()}
                  onSubmit={(values) => handleSave(values, 'splash_content')}
                  onCancel={() => setIsEditing(false)}
                  fields={[
                    { name: "appIcon", label: "App Icon", type: "image", preview: currentData?.appIcon, helpText: "Upload app icon (PNG/JPG)" },
                    { name: "splashImage", label: "Splash Screen Image", type: "image", preview: currentData?.splashImage, helpText: "Full screen background image" }
                  ]}
                />
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};

// Preview Component 
const SectionPreview = ({ data, type, onEdit }) => {
  // Empty state
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <FiImage className="w-8 h-8 text-slate-300 stroke-[1.5]" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Content Yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm font-medium">
          It looks like this section hasn't been set up yet. Add detail to get started.
        </p>
        <button
          onClick={onEdit}
          className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-[13px] font-semibold hover:bg-brand-700 transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Add Content
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
        <div>
          <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1 block">Preview</span>
          <h3 className="text-2xl font-bold text-slate-800">{type === 'about_us' ? data.title : SECTIONS[type].label}</h3>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-50 text-brand-700 font-semibold border border-brand-200 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all shadow-sm active:scale-95 text-[13px] cursor-pointer"
        >
          <FiEdit2 className="w-4 h-4" /> Edit Content
        </button>
      </div>

      {/* ABOUT US PREVIEW */}
      {type === 'about_us' && (
        <div className="space-y-6">
          {(data.image?.url || data.image) && (
            <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm max-h-[400px]">
              <img src={data.image?.url || data.image} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}
          <div
            className="prose prose-lg max-w-none text-slate-600 prose-headings:text-slate-800 prose-a:text-brand-600"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        </div>
      )}

      {/* PROCEED TO SCAN PREVIEW */}
      {type === 'proceed_scan' && (
        <div className="max-w-2xl mx-auto text-center space-y-8 py-10">
          {data.image && (
            <div className="flex justify-center">
              <img src={data.image} alt="Illustration" className="w-64 h-auto object-contain drop-shadow-sm" />
            </div>
          )}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Display Text</h4>
            <div
              className="text-gray-800"
              dangerouslySetInnerHTML={{ __html: data.text }}
            />
          </div>
        </div>
      )}

      {/* SPLASH CONTENT PREVIEW */}
      {type === 'splash_content' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-6">
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">App Icon</h4>
            {data.appIcon ? (
              <div className="w-32 h-32 rounded-3xl shadow-lg border border-gray-100 overflow-hidden bg-white">
                <img src={data.appIcon} alt="App Icon" className="w-full h-full object-cover" />
              </div>
            ) : <span className="text-gray-400 italic">No Icon Uploaded</span>}
            <p className="text-xs text-gray-400 mt-3">Used for app launcher and notifications</p>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Splash Screen</h4>
            {data.splashImage ? (
              <div className="relative w-48 aspect-[9/16] rounded-2xl shadow-xl border border-gray-200 overflow-hidden bg-gray-900">
                <img src={data.splashImage} alt="Splash" className="w-full h-full object-cover opacity-90" />
                {/* Mock UI overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              </div>
            ) : <span className="text-gray-400 italic">No Splash Image Uploaded</span>}
            <p className="text-xs text-gray-400 mt-3">Initial loading screen background</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable Form Component
const SectionForm = ({ initialValues, validationSchema, onSubmit, onCancel, fields }) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true);
        await onSubmit(values);
        setSubmitting(false);
      }}
    >
      {({ values, setFieldValue, isSubmitting, errors, touched }) => (
        <FormikForm className="space-y-6 max-w-3xl animate-fade-in-up">
          {fields.map((field, idx) => (
            <div key={idx}>
              <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                {field.label}
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  name={field.name}
                  value={values[field.name]}
                  onChange={(e) => setFieldValue(field.name, e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-[14px] rounded-lg focus:ring-2 focus:ring-brand-100 focus:border-brand-500 block p-3 outline-none transition-colors shadow-sm hover:border-brand-300"
                  placeholder={`Enter ${field.label}`}
                />
              )}

              {field.type === 'editor' && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <ModernEditor
                    value={values[field.name]}
                    onChange={(content) => setFieldValue(field.name, content)}
                  />
                </div>
              )}

              {field.type === 'image' && (
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-brand-50 hover:border-brand-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                        <p className="text-[12px] text-slate-500 font-medium">Click to upload {field.label}</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            setFieldValue(field.name, e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    {field.helpText && <p className="text-xs text-gray-400 mt-2">{field.helpText}</p>}
                  </div>

                  {/* Preview Logic */}
                  {(values[field.name] instanceof File ? URL.createObjectURL(values[field.name]) : values[field.name]) ? (
                    <div className="w-32 h-32 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shrink-0 relative">
                      <img
                        src={values[field.name] instanceof File ? URL.createObjectURL(values[field.name]) : values[field.name]}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center p-2 shrink-0">
                      No Image
                    </div>
                  )}
                </div>
              )}

              {errors[field.name] && touched[field.name] && (
                <div className="text-rose-600 text-[12px] font-medium mt-1">{errors[field.name]}</div>
              )}
            </div>
          ))}

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-[13px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </FormikForm>
      )}
    </Formik>
  );
}

export default DynamicContent;
