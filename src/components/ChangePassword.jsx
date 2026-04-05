import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { changePassword } from "../../services/Auth/AuthServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../Firebase";
import { logout } from "../store/profileSlice";
import { useDispatch } from "react-redux";
const ChangePassword = () => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useDispatch();
  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Old password is required"),
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords do not match")
      .required("Confirm password is required"),
  });
  const navigate = useNavigate();




  const changePassword = async ({ oldPassword, newPassword }) => {

    const user = auth.currentUser;

    if (!user || !user.email) {
      throw new Error("User not authenticated");
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      oldPassword
    );

    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    return true;
  };






  const handleSubmit = async (values, { resetForm }) => {
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      toast.success("Password changed successfully");
      resetForm();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error(error);

      // Firebase error handling
      if (error.code === "auth/wrong-password") {
        toast.error("Old password is incorrect");
      } else if (error.code === "auth/requires-recent-login") {
        toast.error("Please login again and retry");
      } else {
        toast.error(error.message || "Failed to change password");
      }
    }
  };


  return (
    <div className="w-full m-5 md:w-[55%] bg-[#FFFFFF] p-5 rounded-[24px] border border-[#E5E5E5]">
      <Formik
        initialValues={{ oldPassword: "", newPassword: "", confirmPassword: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="flex flex-col gap-5">

            {/* OLD PASSWORD */}
            <div className="flex flex-col gap-3">
              <label className="text-[14px] font-semibold">Old Password</label>
              <div className="relative">
                <Field
                  type={showOld ? "text" : "password"}
                  name="oldPassword"
                  placeholder="Old Password"
                  className="border bg-[#FAF9F9] border-[#E5E5E5] rounded-[50px] font-medium p-4 pr-12 text-[16px] text-[#5F5F5F] w-full"
                />
                <span
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-5 top-4 cursor-pointer text-[#5F5F5F]"
                >
                  {showOld ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <ErrorMessage name="oldPassword" component="div" className="text-red-500 text-sm ml-2" />
            </div>

            {/* NEW PASSWORD */}
            <div className="flex flex-col gap-3">
              <label className="text-[14px] font-semibold">New Password</label>
              <div className="relative">
                <Field
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  placeholder="New Password"
                  className="border bg-[#FAF9F9] border-[#E5E5E5] rounded-[50px] font-medium p-4 pr-12 text-[16px] text-[#5F5F5F] w-full"
                />
                <span
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-5 top-4 cursor-pointer text-[#5F5F5F]"
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <ErrorMessage name="newPassword" component="div" className="text-red-500 text-sm ml-2" />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="flex flex-col gap-3">
              <label className="text-[14px] font-semibold">Confirm Password</label>
              <div className="relative">
                <Field
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="border bg-[#FAF9F9] border-[#E5E5E5] rounded-[50px] font-medium p-4 pr-12 text-[16px] text-[#5F5F5F] w-full"
                />
                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-5 top-4 cursor-pointer text-[#5F5F5F]"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm ml-2" />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full cursor-pointer bg-[#0f6845] text-[#FFFFFF] text-[14px] font-medium py-3 rounded-[100px]"
            >
              Update Password
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ChangePassword;
