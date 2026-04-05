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
} from "firebase/firestore";
import { ThreeDots } from "react-loader-spinner";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import TagsDropdown, { FormField, HybridSelect, ImageUploadWithPreview, SelectField, TextArea } from "./Fields";
import StreamModal from "./AddStream";
import { toast } from "react-toastify";
import PackageDropdown from "./PackageDropown";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import LanguageMultiSelect from "./LanguageSelector";

// Validation Schemas
const step1Schema = (isEdit) => Yup.object({
  appStoreProductId: isEdit ? Yup.string() : Yup.string().required("Required"),
  appStoreName: isEdit ? Yup.string() : Yup.string().required("Required"),
  appStoreType: isEdit ? Yup.string() : Yup.string().required("Required"),
  appStorePrice: isEdit ? Yup.string() : Yup.string().required("Required"),
  appStoreDesc: isEdit ? Yup.string() : Yup.string().required("Required"),
});

const step2Schema = (isEdit) => Yup.object({
  playStoreProductId: isEdit ? Yup.string() : Yup.string().required("Required"),
  playStoreTitle: isEdit ? Yup.string() : Yup.string().required("Required"),
  playStoreDesc: isEdit ? Yup.string() : Yup.string().required("Required"),
});

const step3Schema = (isEdit) => Yup.object({
  packageName: Yup.string().required("Required"),
  description: Yup.string().required("Required"),
  language: Yup.array()
    .min(1, "Select at least one language")
    .required("Required"),
  price: Yup.number().min(0).required("Required"),
  packageType: Yup.string().required("Required"),
  packageCategory: Yup.string().required("Required"),
  startDate: Yup.string()
    .required("Required")
    .test("is-future", "Start time cannot be in the past", function (value) {
      if (isEdit) return true;
      if (!value) return true;
      return moment(value).isAfter(moment());
    }),
  endDate: Yup.string()
    .required("Required")
    .test("is-after", "End time must be after start time", function (endDate) {
      const { startDate } = this.parent;
      if (!startDate || !endDate) return true;
      return moment(endDate).isAfter(moment(startDate));
    })
});


const PackageForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [coupons, setCoupons] = useState([]);
  const [editData, setEditData] = useState({})
  const [loading, setLoading] = useState(false);
  const [packageId, setPackageId] = useState();
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [submitType, setSubmitType] = useState("draft");
  const [currentStep, setCurrentStep] = useState(1);
  const [appleApiId, setAppleApiId] = useState(null);
  const [isUploading, setIsuplading] = useState(false);

  const [openStreamModal, setOpenStreamModal] = useState(false); // Unused but kept for consistency if needed

  const navigate = useNavigate()

  const fetchById = async () => {
    try {
      setLoading(true);

      const docRef = doc(db, "packages", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setEditData({
          _id: snapshot.id,
          ...snapshot.data(),
        });
      } else {
        toast.error("Package not found");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchById()
    }
  }, [])

  const toDateTimeLocal = (value) => {
    if (!value) return "";

    // Handle Firestore Timestamp
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

  const initialValues = {
    // Step 1: App Store
    appStoreProductId: editData?.appStoreConfig?.productId || editData?.appleProductId || "",
    appStoreName: editData?.appStoreConfig?.name || editData?.packageName || "",
    appStoreType: editData?.appStoreConfig?.type || "SUBSCRIPTION",
    appStorePrice: editData?.appStoreConfig?.price ? String(editData.appStoreConfig.price) : "",
    appStoreDesc: editData?.appStoreConfig?.localizationDescription || editData?.description || "",
    appStoreReviewNote: editData?.appStoreConfig?.reviewNote || "",

    // Step 2: Play Store
    playStoreProductId: editData?.playStoreConfig?.productId || editData?.googleProductId || "",
    playStoreTitle: editData?.playStoreConfig?.title || editData?.packageName || "",
    playStoreDesc: editData?.playStoreConfig?.description || editData?.description || "",

    // Step 3: Package Details
    packageName: editData?.packageName || "",
    packageId: editData?.packageId || "",
    description: editData?.description || "",
    language: editData?.language || [],
    price: editData?.price || "",
    packageType: editData?.packageType ? editData.packageType.charAt(0).toUpperCase() + editData.packageType.slice(1).toLowerCase() : "",
    packageCategory: editData?.packageCategory || "",
    startDate: toDateTimeLocal(editData?.startDate) || "",
    coupons: editData?.coupons || [],
    endDate: toDateTimeLocal(editData?.endDate) || "",
    programIds: editData?.programIds || [],
    packageTags: editData?.packageTags || [],
    image: null,
  };

  const fetchOptions = async () => {
    const tagsSnapshot = await getDocs(collection(db, "packageTags"));
    const catsSnapshot = await getDocs(collection(db, "packageCategories"));

    setTags(tagsSnapshot.docs.map(doc => doc.data().name));
    setCategories(catsSnapshot.docs.map(doc => doc.data().name));
  };
  const fetchPackages = async () => {
    const snap = await getDocs(collection(db, "programs"));
    setPackages(
      snap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().programName,
      }))
    );
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
    fetchPackages();
  }, []);

  const handleNextStep = async (values, setTouched, validateForm) => {
    let schema;
    if (currentStep === 1) schema = step1Schema(isEdit);
    if (currentStep === 2) schema = step2Schema(isEdit);

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

            // Capture Apple ID
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

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsuplading(true)
      let imageUrl = editData?.image || "";
      if (values.image) {
        const imageRef = ref(storage, `packages/${Date.now()}`);
        await uploadBytes(imageRef, values.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const payload = {
        ...values,
        price: Number(values.price),
        packageTags: values.packageTags || [],
        image: imageUrl,
        startDate: values.startDate
          ? moment(values.startDate).unix()
          : null,
        type: submitType,
        endDate: values.endDate
          ? moment(values.endDate).unix()
          : null,
        createdAt: isEdit
          ? editData.createdAt
          : serverTimestamp(),
      };

      // App Store Config Payload
      const appStoreData = {
        storeType: "appStore",
        productId: values.appStoreProductId,
        name: values.appStoreName,
        type: values.appStoreType,
        reviewNote: values.appStoreReviewNote || "Review Note",
        localizationDescription: values.appStoreDesc,
        price: values.appStorePrice
      };

      // Play Store Config Payload
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
        await updateDoc(doc(db, "packages", editData._id), payload);
      } else {
        payload.appleProductId = appleApiId || values.appStoreProductId;
        payload.googleProductId = values.playStoreProductId;
        payload.appStoreConfig = appStoreData;
        payload.playStoreConfig = playStoreData;

        const docRef = await addDoc(collection(db, "packages"), payload);
        setPackageId(docRef.id)
        await updateDoc(docRef, {
          packageId: docRef.id,
        })
      }
      for (const tag of payload.packageTags || []) {
        await addIfNotExists("packageTags", tag);
      }
      await addIfNotExists("packageType", payload.packageType);
      await addIfNotExists("packageCategories", payload.packageCategory);

      resetForm();
      if (isEdit) {
        toast.success("Package Updated")
        navigate("/packages")
      } else {
        toast.success("Package Added")
        // navigate("/packages") // Or stay? AddPrograms stays. AddPackage usually navigates.
        // User said "Add in three step same apple and android package and then last step update that with proper validations".
        // It implies flow completion.
        navigate("/packages")
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save package");
    }
    finally {
      setIsuplading(false)
    }
  };

  const programTypes = [
    "Live",
    "Recorded",
    "Webinar",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ThreeDots height="50" width="50" radius="9" visible={true} color="#0f6845" />
      </div>
    );
  }

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
              {isEdit ? "Edit Package" : "Add Package"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Step {currentStep} of 3: {currentStep === 1 ? "App Store Config" : currentStep === 2 ? "Play Store Config" : "Package Details"}
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
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={currentStep === 3 ? step3Schema(isEdit) : currentStep === 1 ? step1Schema(isEdit) : step2Schema(isEdit)}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, isSubmitting, values, setTouched, validateForm }) => (
              <Form className="flex flex-col gap-6">

                {currentStep === 1 && (
                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-4 border-b border-blue-100 pb-2">
                      <i className="fa-brands fa-apple text-xl text-gray-800"></i>
                      <h3 className="text-lg font-bold text-gray-900">App Store Configuration</h3>
                    </div>
                    <div className="space-y-4">
                      <FormField name="appStoreProductId" label="Product ID" placeholder="e.g. IAP.API.TEST.PACKAGE" disabled={isEdit} />
                      <FormField name="appStoreName" label="Reference Name" placeholder="e.g. TEST Package Name" disabled={isEdit} />

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
                      <FormField name="playStoreTitle" label="Product Title" placeholder="e.g. One Time Package Test API" disabled={isEdit} />
                      <FormField name="playStoreDesc" label="Localization Description" placeholder="e.g. One-time unlock / premium access" disabled={isEdit} />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Package Information</h3>

                      {/* Show IDs from previous steps as readonly or info if desired */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm mb-4 border border-gray-200">
                        <div><span className="font-semibold text-gray-600">App Store ID:</span> {values.appStoreProductId || "N/A"}</div>
                        <div><span className="font-semibold text-gray-600">Play Store ID:</span> {values.playStoreProductId || "N/A"}</div>
                      </div>

                      <FormField name="packageName" label="Package Name" placeholder="e.g. Premium Annual Plan" />
                      <TextArea name="description" label="Description" placeholder="Enter package details..." />
                    </div>

                    {/* Details */}
                    <div className="space-y-6 pt-4">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Package Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <LanguageMultiSelect name="language" />
                        </div>
                        <div>
                          <FormField name="price" label="Price" type="number" placeholder="0.00" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <HybridSelect
                          name="packageCategory"
                          label="Package Category"
                          options={categories}
                        />
                        <HybridSelect
                          name="packageType"
                          label="Package Type"
                          options={programTypes}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          name="startDate"
                          label="Start Time"
                          type="datetime-local"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                        <FormField name="endDate" label="End Time" type="datetime-local" />
                      </div>
                    </div>

                    {/* Content & Metadata */}
                    <div className="space-y-6 pt-4">
                      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Content & Metadata</h3>

                      <TagsDropdown
                        name="packageTags"
                        label="Tags"
                        options={tags}
                      />

                      <PackageDropdown
                        name="programIds"
                        label="Select Programs"
                        options={packages}
                        labelKey="name"
                        valueKey="id"
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
                        label="Package Image"
                        existingImage={editData?.image}
                      />
                    </div>
                  </>
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
                          setSubmitType("draft");
                          // Manually submit
                          // We need to trigger Formik submit. 
                          // The easiest way is button type="submit" but we have two buttons.
                          // Dispatching submit event as in AddProgram
                          document.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                        }}
                        className={`flex justify-center  cursor-pointer items-center gap-2 py-3 px-6 rounded-xl font-semibold transition-colors
                          ${isUploading
                            ? "bg-gray-100 text-gray-400  cursor-not-allowed"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                      >
                        <i className="fa-regular fa-file"></i>
                        Save as Draft
                      </button>

                      <button
                        type="button"
                        disabled={isUploading || isSubmitting}
                        onClick={() => {
                          setSubmitType("publish");
                          document.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                        }}
                        className={`flex justify-center cursor-pointer items-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all shadow-sm
                          ${isUploading
                            ? "bg-purple-300 text-white cursor-not-allowed"
                            : "bg-[#0f6845] text-white hover:bg-[#7f00d4] active:scale-95"
                          }`}
                      >
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        {isUploading ? "Processing..." : "Publish Package"}
                      </button>
                    </div>
                  )}
                </div>

              </Form>
            )}
          </Formik>
        </div>
      </div>

    </div>
  );
};

export default PackageForm;