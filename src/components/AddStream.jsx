import { Dialog } from "@headlessui/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../Firebase";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ProgramTagsDropdown } from "./Fields";


const StreamSchema = Yup.object({
  streamName: Yup.string().required("Stream name required"),
});

const StreamModal = ({ open, onClose, programId, editData, page }) => {
  const isEdit = Boolean(editData);
  const [tags, setTags] = useState([]);
  const [preview, setPreview] = useState(editData?.image || "");
  const [isUploading, setIsUplaoding] = useState(false)
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    setPreview(editData?.image || "");
  }, [editData]);


  const fetchOptions = async () => {
    const tagsSnapshot = await getDocs(collection(db, "streamTags"));

    setTags(tagsSnapshot.docs.map(doc => doc.data().name));

  };
  useEffect(() => {
    fetchOptions()
  }, [])


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
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-[#0f6845] mb-4">
            {editData ? "Edit Stream" : "Add Stream"}
          </Dialog.Title>

          <Formik
            enableReinitialize
            initialValues={{
              streamName: editData?.streamName || "",
              image: null,
              tags: Array.isArray(editData?.tags) ? editData.tags : [],
            }}
            validationSchema={StreamSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                setIsUplaoding(true)
                let imageUrl = editData?.image || "";

                if (values.image) {
                  const imgRef = ref(storage, `programs/streams/${Date.now()}`);
                  await uploadBytes(imgRef, values.image);
                  imageUrl = await getDownloadURL(imgRef);
                }
                const safeTags = Array.isArray(values.tags)
                  ? values.tags.filter(Boolean)
                  : values.tags
                    ? values.tags.split(",").map(t => t.trim()).filter(Boolean)
                    : [];

                // ✅ ALWAYS save tags (new + edit)
                for (const tag of safeTags) {
                  await addIfNotExists("streamTags", tag);
                }

                const payload = {
                  streamName: values.streamName,
                  programId,
                  image: imageUrl,
                  //          tags: Array.isArray(values.tags)
                  // ? values.tags
                  // : values.tags
                  //   ? values.tags.split(",").map(t => t.trim())
                  //   : [],
                  tags: safeTags,
                  createdAt: serverTimestamp(),
                };

                if (editData) {


                  await updateDoc(
                    doc(db, "programs", programId, "streams", editData.streamId),
                    payload
                  );
                } else {


                  const streamRef = await addDoc(
                    collection(db, "programs", programId, "streams"),
                    {
                      ...payload,
                      createdAt: serverTimestamp(),
                    }
                  );

                  await updateDoc(streamRef, {
                    streamId: streamRef.id,
                  });
                }

                resetForm();
                fetchOptions()
                setPreview("");
                toast.success("Stream Added")
              } catch (err) {
                console.error(err);
              } finally {
                setIsUplaoding(false)
              }
            }}
          >
            {({ setFieldValue, errors, touched }) => (
              <Form className="space-y-4">
                {/* Stream Name */}
                <div>
                  <label className="text-sm font-medium">Stream Name</label>
                  <Field
                    name="streamName"
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-[#0f6845]"
                  />
                  {errors.streamName && touched.streamName && (
                    <p className="text-red-500 text-xs">{errors.streamName}</p>
                  )}
                </div>


                <div>

                  <ProgramTagsDropdown
                    name="tags"
                    label="Tags"
                    options={tags}
                  />
                  {errors.tags && touched.tags && (
                    <p className="text-red-500 text-xs">{errors.tags}</p>
                  )}
                </div>







                {/* Image Upload */}
                <div>
                  <label className="text-sm font-medium">Image</label>

                  {/* Upload Box */}
                  <div
                    onClick={() => !preview && fileInputRef.current.click()}
                    className="mt-2 w-full h-40 border-2 border-dashed border-[#0f6845] rounded-xl flex items-center justify-center bg-[#FAF5FF] cursor-pointer relative overflow-hidden"
                  >
                    {preview ? (
                      <>
                        <img
                          src={preview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />

                        {/* ❌ Remove Image */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreview("");
                            setFieldValue("image", null);
                            fileInputRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                        >
                          <XMarkIcon className="w-5 h-5 text-red-500" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[#0f6845] text-sm">
                        Click to upload image
                      </span>
                    )}
                  </div>

                  {/* 🔒 Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      setFieldValue("image", file);
                      setPreview(URL.createObjectURL(file));
                    }}
                  />
                </div>


                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  {page === "program" ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate("/programs");
                      }}
                      className="col-span-2 mt-4 cursor-pointer p-3 rounded-lg border font-semibold transition"
                    >
                      Program List
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="col-span-2 mt-4 cursor-pointer p-3 rounded-lg border font-semibold transition"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`col-span-2 mt-4 cursor-pointer p-3 rounded-lg font-semibold transition
      ${isUploading
                        ? "bg-gray-400"
                        : "bg-[#0f6845] text-white hover:opacity-90"
                      }
    `}
                  >
                    {isUploading
                      ? isEdit
                        ? "Updating..."
                        : "Uploading..."
                      : isEdit
                        ? "Update Stream"
                        : "Create Stream"}
                  </button>
                </div>

              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default StreamModal;
