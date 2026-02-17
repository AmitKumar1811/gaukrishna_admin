import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { storage } from "../Firebase";
import { db } from "../Firebase";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  query, where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import TagsDropdown, { FormField, HybridSelect, ImageUploadWithPreview, ProgramTagsDropdown, SelectField, TextArea } from "./Fields";
import StreamModal from "./AddStream";
import { toast } from "react-toastify";
import PackageDropdown from "./PackageDropown";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment/moment";
import LanguageMultiSelect from "./LanguageSelector";

const step1Schema = Yup.object({
  appStoreProductId: Yup.string().required("Required"),
  appStoreName: Yup.string().required("Required"),
  appStoreType: Yup.string().required("Required"),
  appStorePrice: Yup.string().required("Required"),
  appStoreDesc: Yup.string().required("Required"),
});

const step2Schema = Yup.object({
  playStoreProductId: Yup.string().required("Required"),
  playStoreTitle: Yup.string().required("Required"),
  playStoreDesc: Yup.string().required("Required"),
});

const step3Schema = (isEdit) => Yup.object({
  programName: Yup.string().required("Required"),
  description: Yup.string().required("Required"),
  language: Yup.array()
    .min(1, "Select at least one language")
    .required("Required"),
  // price: Yup.number().min(0).required("Required"),
  programType: Yup.string().required("Required"),
  programCategory: Yup.string().required("Required"),
  startTime: Yup.string()
    .required("Required")
    .test("is-future", "Start time cannot be in the past", function (value) {
      if (isEdit) return true;
      if (!value) return true;
      return moment(value).isAfter(moment());
    }),
  endTime: Yup.string()
    .required("Required")
    .test("is-after", "End time must be after start time", function (endTime) {
      const { startTime } = this.parent;
      if (!startTime || !endTime) return true;

      const start = moment(startTime);
      const startDateStr = start.format("YYYY-MM-DD");
      const end = moment(`${startDateStr}T${endTime}`);

      return end.isAfter(start);
    }),
  coupons: Yup.array(),
});

const ProgramForm = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({})
  const isEdit = Boolean(id);
  const [submitType, setSubmitType] = useState("draft");
  const [currentStep, setCurrentStep] = useState(1);

  const fetchById = async () => {
    try {
      setLoading(true);

      const docRef = doc(db, "programs", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setEditData({
          _id: snapshot.id,
          ...snapshot.data(),
        })

      } else {
        toast.error("Programs not found");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) {
      fetchById()
    }
  }, [])

  const toDateTimeLocal = (value) => {
    if (!value) return "";

    if (value && typeof value === 'object' && 'seconds' in value) {
      return moment.unix(value.seconds).format("YYYY-MM-DDTHH:mm");
    }

    const num = Number(value);
    if (!isNaN(num)) {
      if (num < 100000000000) {
        return moment.unix(num).format("YYYY-MM-DDTHH:mm");
      }
      return moment(num).format("YYYY-MM-DDTHH:mm");
    }

    return moment(value).format("YYYY-MM-DDTHH:mm");
  };

  const toTimeLocal = (value) => {
    if (!value) return "";

    if (value && typeof value === 'object' && 'seconds' in value) {
      return moment.unix(value.seconds).format("HH:mm");
    }

    const num = Number(value);
    if (!isNaN(num)) {
      if (num < 100000000000) {
        return moment.unix(num).format("HH:mm");
      }
      return moment(num).format("HH:mm");
    }

    return moment(value).format("HH:mm");
  };

  const [appleApiId, setAppleApiId] = useState(null);


  const [openStreamModal, setOpenStreamModal] = useState(false);
  const [editStream, setEditStream] = useState(null);
  const [programId, setProgramId] = useState();
  const [tags, setTags] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate()

  const initialValues = {
    programName: editData?.programName || "",

    appStoreProductId: editData?.appleProductId || editData?.productId || "",
    appStoreName: editData?.programName || "",
    appStoreType: editData?.appStoreConfig?.type || "CONSUMABLE",
    appStorePrice: editData?.appStorePrice ? String(editData.appStorePrice) : "",
    appStoreDesc: editData?.description || "",
    appStoreReviewNote: "",

    playStoreProductId: editData?.googleProductId || editData?.productId || "",
    playStoreTitle: editData?.programName || "",
    playStorePrice: editData?.playStorePrice ? String(editData.playStorePrice) : "",
    playStoreDesc: editData?.description || "",

    programId: editData?.programId || "",
    description: editData?.description || "",
    language: Array.isArray(editData?.language)
      ? editData.language
      : editData?.language
        ? [editData.language]
        : [],
    // price: editData?.price || "",
    programType: editData?.programType || "",
    programCategory: editData?.programCategory || "",
    startTime: toDateTimeLocal(editData?.startTime) || "",
    endTime: toTimeLocal(editData?.endTime) || "",
    status: editData?.statusMode === "manual" ? editData?.status : "Automatic",
    // isCommentaryEnabled: editData?.isCommentaryEnabled || false,

    tags: Array.isArray(editData?.tags) ? editData.tags : [],
    coupons: Array.isArray(editData?.coupons)
      ? editData.coupons.map(String)
      : [],

    image: null,
  };

  const [isUploading, setIsuplading] = useState(false)
  const addIfNotExists = async (collectionName, name) => {
    if (!name || typeof name !== "string") return;

    const q = query(
      collection(db, collectionName),
      where("name", "==", name)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      const docRef = await addDoc(collection(db, collectionName), {
        name,
        createdAt: serverTimestamp(),
      });

      await updateDoc(docRef, {
        [`${collectionName.slice(0, -1)}Id`]: docRef.id,
      });
    }
  };

  const fetchOptions = async () => {
    const tagsSnapshot = await getDocs(collection(db, "tags"));
    const catsSnapshot = await getDocs(collection(db, "categories"));

    setTags(tagsSnapshot.docs.map(doc => doc.data().name));
    setCategories(catsSnapshot.docs.map(doc => doc.data().name));
  };

  const fetchCoupons = async () => {
    const snap = await getDocs(collection(db, "coupons"));
    setCoupons(
      snap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().code,
      }))
    );
  };

  useEffect(() => {
    fetchOptions();
    fetchCoupons();
  }, []);

  const handleSubmit = async (values, { resetForm }) => {

    try {
      setIsuplading(true)
      let imageUrl = editData?.image || "";
      if (values.image) {

        const imageRef = ref(storage, `programs/${Date.now()}`);
        await uploadBytes(imageRef, values.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      let finalEndTime = null;
      if (values.startTime && values.endTime) {
        const startDateStr = moment(values.startTime).format("YYYY-MM-DD");
        const combinedEnd = moment(`${startDateStr}T${values.endTime}`);
        finalEndTime = combinedEnd.unix();
      }

      const payload = {
        ...values,
        // price: Number(values.price),
        startTime: values.startTime
          ? moment(values.startTime).unix()
          : null,
        type: submitType,
        endTime: finalEndTime,
        tags: Array.isArray(values.tags)
          ? values.tags
          : values.tags
            ? values.tags.split(",").map(t => t.trim())
            : [],
        coupons: values.coupons || [],
        image: imageUrl,
        createdAt: editData?.createdAt ?? serverTimestamp(),
        // Status Handling: Always reset to Automatic on Edit/Create
        statusMode: "automatic",
        status: "upcoming", // Field is ignored in automatic mode, but provided for schema consistency
      };

      // App Store Payload
      const appStoreData = {
        storeType: "appStore",
        productId: values.appStoreProductId,
        name: values.appStoreName,
        type: values.appStoreType,
        reviewNote: values.appStoreReviewNote || "Review Note",
        localizationDescription: values.appStoreDesc,
        price: values.appStorePrice
      };

      // Play Store Payload
      const playStoreData = {
        storeType: "playStore",
        packageName: "com.smartremotelive.app",
        productId: values.playStoreProductId,
        title: values.playStoreTitle,
        description: values.playStoreDesc,
        regionCode: "IN",
        currencyCode: "INR",
        units: values.appStorePrice ? String(values.appStorePrice).split('.')[0] : ""
      };

      if (isEdit) {
        await updateDoc(doc(db, "programs", editData._id), payload);
      } else {
        payload.productId = appleApiId || values.appStoreProductId;
        payload.appleProductId = appleApiId || values.appStoreProductId;
        payload.googleProductId = values.playStoreProductId;
        payload.appStoreConfig = appStoreData;
        payload.playStoreConfig = playStoreData;
        const docRef = await addDoc(collection(db, "programs"), payload);
        setProgramId(docRef.id)
        await updateDoc(docRef, {
          programId: docRef.id,
        });

      }
      const safeTags = Array.isArray(payload.tags)
        ? payload.tags.filter(Boolean)
        : [];

      for (const tag of safeTags) {
        await addIfNotExists("tags", tag);
      }
      await addIfNotExists("categories", payload.programCategory);
      await addIfNotExists("programType", payload.programType);
      resetForm();

      if (isEdit) {
        toast.success("Program Updated")
        navigate(`/program/${id}`)
      } else {
        toast.success("Program Added")
        setEditStream(null);
        setOpenStreamModal(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save program");
    }
    finally {
      setIsuplading(false)
    }
  };

  const programCategories = [
    "Sports",
    "Education",
    "Entertainment",
    "Comedy",
  ];

  const programTypes = [
    "Live",
    "Recorded",
    "Webinar",
  ];

  const handleNextStep = async (values, setTouched, validateForm) => {
    let schema;
    if (currentStep === 1) schema = step1Schema;
    if (currentStep === 2) schema = step2Schema;

    try {
      if (schema) {
        await schema.validate(values, { abortEarly: false });
      }

      // API Call Handling
      if (!isEdit) {
        setIsuplading(true);
        const commonHeaders = { 'Content-Type': 'application/json' };
        const apiUrl = 'https://us-central1-smartremote-eade7.cloudfunctions.net/api/product';

        if (currentStep === 1) {
          const appStoreData = {
            storeType: "appStore",
            productId: values.appStoreProductId,
            name: values.appStoreName,
            type: values.appStoreType,
            reviewNote: values.appStoreReviewNote || "Review Note",
            localizationDescription: values.appStoreDesc,
            price: values.appStorePrice
          };

          try {
            const res = await fetch(apiUrl, {
              method: 'POST',
              headers: commonHeaders,
              body: JSON.stringify(appStoreData)
            });
            if (!res.ok) {
              const errorText = await res.text();
              let errMsg = "App Store Creation Failed";
              try {
                const parsed = JSON.parse(errorText);
                errMsg = parsed?.data?.errors?.[0]?.detail || parsed?.message || errMsg;
              } catch (e) { }
              throw new Error(errMsg);
            }

            // 🔹 CAPTURE APPLE ID
            try {
              const resJson = await res.json();
              if (resJson?.iap?.data?.id) {
                console.log("Captured Apple ID:", resJson.iap.data.id);
                setAppleApiId(resJson.iap.data.id);
              }
            } catch (e) {
              console.warn("Could not parse success response JSON for ID capture", e);
            }

            toast.success("App Store Product Created");
          } catch (e) {
            toast.error(e.message);
            setIsuplading(false);
            return; // Stop navigation
          }
        } else if (currentStep === 2) {
          const playStoreData = {
            storeType: "playStore",
            packageName: "com.smartremotelive.app",
            productId: values.playStoreProductId,
            title: values.playStoreTitle,
            description: values.playStoreDesc,
            regionCode: "IN",
            currencyCode: "INR",
            units: values.appStorePrice ? String(values.appStorePrice).split('.')[0] : ""
          };

          try {
            const res = await fetch(apiUrl, {
              method: 'POST',
              headers: commonHeaders,
              body: JSON.stringify(playStoreData)
            });
            if (!res.ok) {
              const errorText = await res.text();
              let errMsg = "Play Store Creation Failed";
              try {
                const parsed = JSON.parse(errorText);
                errMsg = parsed?.data?.errors?.[0]?.detail || parsed?.message || errMsg;
              } catch (e) { }
              throw new Error(errMsg);
            }
            toast.success("Play Store Product Created");
          } catch (e) {
            toast.error(e.message);
            setIsuplading(false);
            return; // Stop navigation
          }
        }
      }

      setIsuplading(false);
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      setIsuplading(false);
      if (err instanceof Yup.ValidationError) {
        const touched = {};
        err.inner.forEach((error) => {
          touched[error.path] = true;
        });
        setTouched(touched);
        validateForm(); // Trigger formik to show errors
      } else {
        console.error(err);
      }
    }
  };


  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-gray-900 border border-gray-200 shadow-sm transition-colors">
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isEdit ? "Edit Program" : "Add Program"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Step {currentStep} of 3: {currentStep === 1 ? "App Store Config" : currentStep === 2 ? "Play Store Config" : "Program Details"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {/* Steps Indicator */}
          <div className="flex mb-8 items-center">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? "text-purple-600 font-bold" : "text-gray-400"}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? "border-purple-600 bg-purple-50" : "border-gray-300"}`}>1</span>
              <span>App Store</span>
            </div>
            <div className={`h-[2px] w-12 mx-3 ${currentStep >= 2 ? "bg-purple-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-purple-600 font-bold" : "text-gray-400"}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? "border-purple-600 bg-purple-50" : "border-gray-300"}`}>2</span>
              <span>Play Store</span>
            </div>
            <div className={`h-[2px] w-12 mx-3 ${currentStep >= 3 ? "bg-purple-600" : "bg-gray-200"}`}></div>
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? "text-purple-600 font-bold" : "text-gray-400"}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? "border-purple-600 bg-purple-50" : "border-gray-300"}`}>3</span>
              <span>Details</span>
            </div>
          </div>


          <Formik
            initialValues={initialValues}
            validationSchema={currentStep === 3 ? step3Schema(isEdit) : currentStep === 1 ? step1Schema : step2Schema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ values, setTouched, validateForm, isSubmitting }) => (
              <Form className="flex flex-col gap-6">

                {currentStep === 1 && (
                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-4 border-b border-blue-100 pb-2">
                      <i className="fa-brands fa-apple text-xl text-gray-800"></i>
                      <h3 className="text-lg font-bold text-gray-900">App Store Configuration</h3>
                    </div>
                    <div className="space-y-4">
                      <FormField name="appStoreProductId" label="Product ID" placeholder="e.g. IAP.API.TEST22.PRODUCT" disabled={isEdit} />
                      <FormField name="appStoreName" label="Reference Name" placeholder="e.g. TEST 22 Product Name" disabled={isEdit} />

                      <SelectField name="appStoreType" label="Type" disabled={isEdit}>
                        <option value="CONSUMABLE">Consumable</option>
                        <option value="NON_CONSUMABLE">Non-Consumable</option>
                        <option value="SUBSCRIPTION">Subscription</option>
                      </SelectField>

                      <FormField name="appStorePrice" label="Price Tier" placeholder="e.g. 200.0" disabled={isEdit} />
                      <FormField name="appStoreDesc" label="Localization Description" placeholder="e.g. This is product description for en-US locale" disabled={isEdit} />
                      <FormField name="appStoreReviewNote" label="Review Note" placeholder="e.g. Write a review note for Apple reviewer" disabled={isEdit} />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-4 border-b border-green-100 pb-2">
                      <i className="fa-brands fa-google-play text-xl text-green-600"></i>
                      <h3 className="text-lg font-bold text-gray-900">Play Store Configuration</h3>
                    </div>
                    <div className="space-y-4">
                      <FormField name="playStoreProductId" label="Product ID" placeholder="e.g. 123456abc (lowercase)" disabled={isEdit} />
                      <FormField name="playStoreTitle" label="Product Title" placeholder="e.g. One Time Product Test API" disabled={isEdit} />
                      <FormField name="playStoreDesc" label="Localization Description" placeholder="e.g. One-time unlock / premium access" disabled={isEdit} />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 animate-fade-in-up">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Basic Information</h3>

                      {/* Show IDs from previous steps as readonly or info if desired */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm mb-4 border border-gray-200">
                        <div><span className="font-semibold text-gray-600">App Store ID:</span> {values.appStoreProductId || "N/A"}</div>
                        <div><span className="font-semibold text-gray-600">Play Store ID:</span> {values.playStoreProductId || "N/A"}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <FormField name="programName" label="Program Name" placeholder="e.g. Morning Yoga Session" />
                        {/* Status is handled automatically based on time */}
                      </div>
                      <TextArea name="description" label="Description" placeholder="Enter a detailed description of the program..." />
                    </div>
                    {/* Details Section */}
                    <div className="space-y-6 pt-4">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Program Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div>
                          <LanguageMultiSelect name="language" />
                        </div>
                        {/* <div>
                          <FormField name="price" label="Price" type="number" placeholder="0.00" />
                        </div> */}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <HybridSelect
                          name="programCategory"
                          label="Program Category"
                          options={categories}
                        />
                        <HybridSelect
                          name="programType"
                          label="Program Type"
                          options={programTypes}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          name="startTime"
                          label="Start Time"
                          type="datetime-local"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                        <FormField name="endTime" label="End Time" type="time" />
                      </div>

                      {/* <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center h-5">
                          <Field type="checkbox" name="isCommentaryEnabled" id="commentary" className="w-4 h-4 text-[#9900FF] bg-gray-100 border-gray-300 rounded focus:ring-[#9900FF]" />
                        </div>
                        <div className="text-sm">
                          <label htmlFor="commentary" className="font-medium text-gray-900">Enable Commentary</label>
                          <p className="text-gray-500 text-xs">Allow users to comment on this program stream.</p>
                        </div>
                      </div> */}
                    </div>

                    {/* Metadata Section */}
                    <div className="space-y-6 pt-4">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Metadata & Media</h3>

                      <ProgramTagsDropdown
                        name="tags"
                        label="Tags"
                        options={tags}
                      />

                      <PackageDropdown
                        name="coupons"
                        label="Select Coupons"
                        options={coupons}
                        labelKey="name"
                        valueKey="id"
                      />

                      <ImageUploadWithPreview
                        name="image"
                        label="Program Image"
                        existingImage={editData?.image}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(curr => curr - 1)}
                      className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div> // Spacer
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => handleNextStep(values, setTouched, validateForm)}
                      className={`px-6 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-semibold shadow-lg shadow-purple-200 cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isUploading ? "Verifying..." : "Next Step"}
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        type="button"
                        disabled={isUploading || isSubmitting}
                        onClick={() => {
                          setSubmitType("draft"); // save as draft
                          document.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                        }}
                        className={`px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isUploading ? "Processing..." : "Save as Draft"}
                      </button>

                      <button
                        type="button"
                        disabled={isUploading || isSubmitting}
                        onClick={() => {
                          setSubmitType("publish"); // publish program
                          document.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                        }}
                        className={`px-6 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-semibold shadow-lg shadow-purple-200 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isUploading ? "Processing..." : "Publish Program"}
                      </button>
                    </div>
                  )}
                </div>

              </Form>
            )}
          </Formik>
        </div>
      </div>

      <StreamModal
        open={openStreamModal}
        onClose={() => setOpenStreamModal(false)}
        programId={programId}
        editData={editStream}
        page={"program"}
      />
    </div>
  );
};

export default ProgramForm;
