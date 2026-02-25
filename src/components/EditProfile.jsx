import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { getPharmacyProfile, updatePharmacyProfile } from "../../services/Admin/adminServices";
import { toast } from "react-toastify";
import { uploadFileToFirebase } from "../utils/imageUpload";
import { ThreeDots } from "react-loader-spinner";
import { loginSuccess } from "../store/profileSlice";
import { useDispatch } from "react-redux";

const EditProfile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [licenseImage, setLicenseImage] = useState(null);
  const [gstImage, setGstImage] = useState(null);
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const [imgUploading, setImgUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await getPharmacyProfile();

      const pharmacy = res.data;

      dispatch(
        loginSuccess({
          user: res?.data,

        })
      );

      formik.setValues({
        name: pharmacy.name || "",
        email: pharmacy.email,
        image: pharmacy.image,   // set if API returns images

      });
      setProfileImage(pharmacy.image ? pharmacy.image : null);

    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false)
    }
  };
  // ✅ Formik setup
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      image: null,
    },
    onSubmit: async (values) => {

      try {
        const payload = {
          name: values.name,
          image: values.image || "",

        };

        const res = await updatePharmacyProfile(payload);
        console.log("✅ Updated profile response:", res);

        toast.success("Profile updated successfully!");
        fetchProfile()


      } catch (error) {
        console.error("❌ Update profile error:", error);
        toast.error("Failed to update profile");
      }
    }

  });

  // ✅ Load pharmacy profile on mount
  useEffect(() => {

    fetchProfile();
  }, []);


  // ✅ Handlers for image previews
  const handleProfileChange = async (e) => {

    try {
      const file = e.target.files[0];
      if (!file) {
        return
      }


      setImgUploading(true);

      const key = `uploads/${Date.now()}_${file.name}`;
      const fileUrl = await uploadFileToFirebase(file, key);
      console.log(fileUrl)
      if (fileUrl) {

        setProfileImage(fileUrl);

        formik.setFieldValue("image", fileUrl);
      }

    } catch (error) {
      console.log("error", error)
    }
    finally {
      setImgUploading(false);  // stop loader
    }
  };

  const handleLicenseChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        return
      }
      const key = `license/${Date.now()}_${file.name}`;
      const fileUrl = await uploadFileToFirebase(file, key);
      if (fileUrl) {
        setLicenseImage(fileUrl);
        formik.setFieldValue("licenseImage", fileUrl);
      }

    } catch (error) {
      console.log("error", error)
    }
  };

  const handleGstChange = async (e) => {

    try {
      const file = e.target.files[0];
      if (!file) {
        return
      }
      const key = `gst/${Date.now()}_${file.name}`;
      const fileUrl = await uploadFileToFirebase(file, key);
      if (fileUrl) {
        setGstImage(fileUrl);
        formik.setFieldValue("gstImage", fileUrl);
      }

    } catch (error) {
      console.log("error", error)
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-10 w-full">
      <ThreeDots
        height="60"
        width="60"
        radius="9"
        visible={true}
        ariaLabel="loading"
        color="#298E9E"
      />
    </div>
  }

  return (
    <div className="flex flex-col gap-5 p-5 bg-[#FAF9F9] min-h-screen">

      <div className="text-[#012547] text-[32px] font-extrabold">Edit Profile</div>

      <div className="w-full md:w-[55%] bg-[#FFFFFF] p-5 rounded-3xl border border-[#E5E5E5]">
        <form className="flex flex-col gap-6" onSubmit={formik.handleSubmit}>
          {/* Pharmacy Image Upload */}
          {/* Pharmacy Image Upload */}
          <div className="flex items-center gap-2">
            <label className="flex flex-col items-center">
              {profileImage ? (
                <img src={profileImage} alt="Pharmacy Preview" className="w-32 h-32 object-cover rounded-full" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#E5E5E5] flex items-center justify-center text-[#5F5F5F] text-[14px]">No Image</div>
              )}

              {imgUploading && (
                <div className="absolute bg-[#ffffffb7] rounded-full w-32 h-32 flex items-center justify-center">
                  <ThreeDots height="40" width="40" radius="9" color="#298E9E" />
                </div>
              )}
            </label>
            <div className="text-[#012547] font-bold underline cursor-pointer" onClick={() => document.getElementById("pharmacyImageInput").click()}>
              Update Profile Image
            </div>
            <input
              type="file"
              accept="image/*"
              id="pharmacyImageInput"
              className="hidden"
              onChange={(e) => handleProfileChange(e)}

            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold">Name</label>
            <input type="text" name="name" placeholder="Name" value={formik.values.name} onChange={formik.handleChange} className="border bg-[#FAF9F9] border-[#E5E5E5] rounded-[50px] p-4 text-[16px] text-[#5F5F5F]" />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              readOnly
              className="border bg-[#FAF9F9] border-[#E5E5E5] rounded-[50px] p-4 text-[16px] text-[#5F5F5F] cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          {/* <div className="flex flex-col gap-2">
  <label className="text-[14px] font-semibold">Phone no.</label>
  <input
    type="text"
    name="phone"
    placeholder="Phone no."
    value={formik.values.phone}
    readOnly
    className="border bg-[#FAF9F9] border-[#E5E5E5] rounded-[50px] p-4 text-[16px] text-[#5F5F5F] cursor-not-allowed"
  />
</div> */}








          {/* Save Button */}
          <div>
            <button type="submit" className="w-full cursor-pointer bg-[#012547] text-[#FFFFFF] text-[16px] font-medium py-3 rounded-[100px]">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
