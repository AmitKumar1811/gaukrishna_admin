import React, { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../Firebase";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Pagination from "../components/Pagiantion";


const Coupons = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const query = useSelector((state) => state.search.query);
  const [coupons, setCoupons] = useState([]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "coupons");
      const snapshot = await getDocs(usersRef);
      let data = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      }));

      if (query) {
        if (query.trim() === "") {
          return
        }
        const lowerQuery = query.toLowerCase();
        data = data.filter(
          (user) =>
            user.code?.toLowerCase().includes(lowerQuery)

        );
      }

      setTotalItems(data.length);

      // Pagination
      const paginated = data.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
      );

      setCoupons(paginated);
    } catch (error) {
      console.error("Error fetching coupon:", error);
      toast.error("Failed to fetch coupons. Check Firebase rules!");
    } finally {
      setLoading(false);
    }
  };


  const generateCouponCode = (length = 10) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    fetchCoupons();
  }, [query, currentPage])

  useEffect(() => {
    setCurrentPage(0);
  }, [query])

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "coupons", id));

      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting Coupon:", error);
      toast.error("Failed to delete Coupon");
    }
  };
  const CouponSchema = Yup.object({
    code: Yup.string().required("Coupon code is required"),
    type: Yup.string().required("Discount type is required"),
    value: Yup.number()
      .typeError("Must be a number")
      .positive("Must be greater than 0")
      .required("Value is required"),
    expiry: Yup.string().required("Expiry date is required"),
  });

  const CouponModal = ({ show, onHide, initialValues, isEditing, editId, onSubmit }) => {

    if (!show) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all" onClick={onHide}>
        <div className="bg-white w-[90%] max-w-lg rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? "Edit Coupon" : "Add New Coupon"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Enter coupon details below</p>
            </div>
            <button
              onClick={onHide}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={CouponSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                const payload = {
                  ...values,
                  updatedAt: serverTimestamp(),
                };

                if (isEditing && editId) {
                  await updateDoc(doc(db, "coupons", editId), payload);
                  toast.success("Coupon updated successfully");
                } else {
                  const docRef = await addDoc(collection(db, "coupons"), {
                    ...payload,
                    createdAt: serverTimestamp(),
                  });

                  await updateDoc(docRef, { couponId: docRef.id });
                  toast.success("Coupon added successfully");
                }

                onSubmit(values);
                resetForm();
                onHide();
              } catch (error) {
                console.error("Error saving coupon:", error);
                toast.error("Something went wrong");
              }
            }}

            enableReinitialize
          >
            {({ isSubmitting, setFieldValue }) => (
              <FormikForm>
                <div className="px-6 py-6 space-y-5">
                  {/* Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coupon Code
                    </label>

                    <div className="flex gap-3">
                      <Field
                        name="code"
                        placeholder="e.g. SUMMER2024"
                        className="flex-1 w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:border-[#0f6845] focus:ring-1 focus:ring-[#0f6845]/20 outline-none transition-all placeholder:text-gray-300"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const code = generateCouponCode();
                          setFieldValue("code", code);
                        }}
                        className="px-4 py-3 cursor-pointer rounded-xl border border-purple-100 bg-purple-50 text-sm font-semibold text-[#0f6845] hover:bg-purple-100 transition-colors whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>

                    <ErrorMessage
                      name="code"
                      component="div"
                      className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type
                    </label>
                    <div className="relative">
                      <Field
                        as="select"
                        name="type"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:border-[#0f6845] focus:ring-1 focus:ring-[#0f6845]/20 outline-none transition-all appearance-none"
                      >
                        <option value="">Select Type</option>
                        <option value="flat">Flat Amount (₹)</option>
                        <option value="percentage">Percentage (%)</option>
                      </Field>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <i className="fa-solid fa-chevron-down text-xs"></i>
                      </div>
                    </div>
                    <ErrorMessage
                      name="type"
                      component="div"
                      className="text-red-500 text-xs mt-1.5"
                    />
                  </div>


                  {/* <div>
                  <label className="block text-sm font-medium mb-1">
                    Coupon Applicable on
                  </label>
                  <Field
                    as="select"
                    name="applicable"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0f6845] outline-none"
                  >
                    <option value="">Select </option>
                    <option value="package">Package</option>
                    <option value="program">Program</option>
                  </Field>
                  <ErrorMessage
                    name="applicable"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div> */}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Value
                      </label>
                      <Field
                        name="value"
                        type="number"
                        placeholder="0"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:border-[#0f6845] focus:ring-1 focus:ring-[#0f6845]/20 outline-none transition-all"
                      />
                      <ErrorMessage
                        name="value"
                        component="div"
                        className="text-red-500 text-xs mt-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <Field
                        type="date"
                        name="expiry"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:border-[#0f6845] focus:ring-1 focus:ring-[#0f6845]/20 outline-none transition-all text-gray-600"
                      />
                      <ErrorMessage
                        name="expiry"
                        component="div"
                        className="text-red-500 text-xs mt-1.5"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-5 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onHide}
                    className="px-5 py-2.5 cursor-pointer rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl cursor-pointer bg-[#0f6845] text-white text-sm font-medium hover:bg-[#8000d4] shadow-md shadow-purple-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <ThreeDots height="20" width="20" color="#fff" /> : (isEditing ? "Update Coupon" : "Create Coupon")}
                  </button>
                </div>
              </FormikForm>
            )}
          </Formik>
        </div>
      </div>
    );
  };

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const emptyForm = {
    code: "",
    // applicable:"",
    type: "",
    value: "",
    expiry: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  /* ---------- Add / Update ---------- */
  const handleSubmit = (values) => {
    if (isEditing) {
      setCoupons((prev) =>
        prev.map((c) =>
          c._id === editId ? { ...c, ...values } : c
        )
      );
    } else {
      fetchCoupons(); // 🔥 always refetch after add
    }
  };


  /* ---------- Edit ---------- */
  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code || "",
      applicable: coupon.applicable || "",
      type: coupon.type || "",
      value: coupon.value || "",
      expiry: coupon.expiry || "",
    });

    setEditId(coupon._id); // ✅ Firestore ID
    setIsEditing(true);
    setShowModal(true);
  };
  const totalPages = Math.ceil(totalItems / itemsPerPage);




  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Coupons
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage discounts and promotional codes</p>
        </div>
        <button
          onClick={() => {
            setFormData(emptyForm);
            setIsEditing(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-[#0f6845] cursor-pointer hover:bg-[#7f00d4] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
        >
          <i className="fa-solid fa-plus text-xs"></i> Add Coupon
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Coupon Code</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount Amount</th>
                {/* <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicable On</th> */}

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valid Till</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <div className="flex justify-center items-center py-20">
                      <ThreeDots height="50" width="50" radius="9" visible={true} color="#0f6845" ariaLabel="three-dots-loading" />
                    </div>
                  </td>
                </tr>
              ) :

                coupons.length > 0 ? (
                  coupons.map((coupon, index) => (
                    <tr key={coupon._id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 text-gray-500 text-sm">{index + 1 + currentPage * itemsPerPage}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 group/id cursor-pointer" onClick={() => copyToClipboard(coupon.code)}>
                          <code className="text-sm font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                            {coupon?.code}
                          </code>
                          <i className="fa-regular fa-copy text-gray-300 group-hover/id:text-[#0f6845] text-[10px] transition-colors"></i>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${coupon?.type === 'percentage'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                          {coupon?.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {coupon?.type === 'percentage' ? `${coupon?.value}%` : `₹ ${coupon?.value}`}
                      </td>
                      {/* <td className="px-6 py-4 text-sm text-gray-600 capitalize">{coupon?.applicable || "_"}</td> */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {coupon?.expiry ? new Date(coupon.expiry).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) : "_"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full text-gray-400 hover:text-[#0f6845] hover:bg-purple-50 transition-colors"
                            title="Edit"
                          >
                            <i className="fa-regular fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="w-8 h-8 flex items-center cursor-pointer  justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <i className="fa-regular fa-folder-open text-4xl mb-3 opacity-50"></i>
                        <p className="text-lg font-medium">No coupons found</p>
                        <p className="text-sm">Create a new coupon to get started.</p>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          {coupons.length > 0 ? (
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{currentPage * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-gray-900">{Math.min((currentPage + 1) * itemsPerPage, totalItems)}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalItems}</span> results
            </div>
          ) : <div />}
          <Pagination pageCount={totalPages} pageValue={currentPage} setPage={setCurrentPage} />
        </div>
      </div>
      <CouponModal
        show={showModal}
        onHide={() => setShowModal(false)}
        initialValues={formData}
        isEditing={isEditing}
        editId={editId}          // ✅ pass id
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Coupons;
