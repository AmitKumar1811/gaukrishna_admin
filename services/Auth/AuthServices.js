// 📁 src/services/Auth/AuthServices.js
import axiosInstance from "../AxiosInstance";
import { LOGIN, REGISTER,VERIFY_PHONE_OTP,VERIFY_EMAIL_OTP, RESEND_EMAIL_OTP, RESEND_PHONE_OTP, CHANGEPASSWORD  } from "../Auth/AuthEndPoints";
import Cookies from "js-cookie";
import { KYC } from "../Admin/adminEndPoints";
const token = Cookies.get("auth_token"); 
const token2 = Cookies.get("statemedAdmin"); 


 // Debug: Log the token value
export const verifyEmailOtp = async (values) => {
  try {
    const response = await axiosInstance.post(`/${VERIFY_EMAIL_OTP}`, values , { headers: {
          Authorization: `Bearer ${token}` || "",
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        }});
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data; // return API error message
    }
    throw new Error("Something went wrong");
  }
};


// Register API
export const registerPharmacy = async (values) => {
  try {
    const response = await axiosInstance.post(`/${REGISTER}`, {
      ...values,
      deviceType: "web",
    });
    return response.data; // ✅ success
  } catch (error) {
    if (error.response && error.response.data) {
      // return the response data instead of throwing
      return error.response.data; 
    }
    console.error("❌ Register API Error:", error);
    throw new Error("Something went wrong");
  }
};

// Login API
export const loginPharmacy = async (values) => {
  try {
    const response = await axiosInstance.post(`/${LOGIN}`, {
      ...values,
        // API expects this
    });

    // ✅ Save token after login
    if (response.data?.data?.token) {
      localStorage.setItem("statemedAdmin", response.data.data.token);
      console.log("✅ Token saved:", response.data.data.token);
    } else {
      console.warn("⚠️ No token found in login response:", response.data);
    }

    return response.data;
  } catch (error) {
    console.error("❌ Login API Error:", error);
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};



export const logoutPharmacy = async () => {
  try {
    const response = await axiosInstance.post(`admin/auth/logout`,{ headers: {
          Authorization: `Bearer ${token2}` || "",
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        }});
    localStorage.removeItem("statemedAdmin");  
    return response.data;
  } catch (error) {
    console.error("❌ Logout API Error:", error);
    throw new Error(error.response?.data?.message || "Failed to logout");
  }
};

export const changePassword = async (data) => {
  try {
    const response = await axiosInstance.put( CHANGEPASSWORD,data);
    localStorage.removeItem("statemedAdmin");  
    return response.data;
  } catch (error) {
    console.error("❌ Logout API Error:", error);
    throw new Error(error.response?.data?.message || "Failed to logout");
  }
};



export const kycUpload = async (data) => {
  try {
    const response = await axiosInstance.post(KYC, data,{ headers: {
          Authorization: `Bearer ${token}` || "",
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        }});
    return response.data;
  } catch (error) {
    console.error("Error updating bank details:", error.response || error);
    throw error;
  }
};



export const resendEmail=async()=>{
  try {
        const response = await axiosInstance.post(RESEND_EMAIL_OTP,{},{ headers: {
          Authorization: `Bearer ${token}` || "",
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        }});
    return response.data;
  } catch (error) {
      console.error("Error updating bank details:", error.response || error);
    throw error;
  }
}






export const verifyPhoneOtp = async (otp) => {
  try {
    const response = await axiosInstance.post(`/${VERIFY_PHONE_OTP}`, { otp }, { headers: {
          Authorization: `Bearer ${token}` || "",
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        }});
    return response.data;
  } catch (error) {
    console.error("❌ Verify Phone OTP API Error:", error);
    throw new Error(error.response?.data?.message || "Failed to verify OTP");
  }
};

export const resendphone=async()=>{
  try {
    console.log("Auth in:", token);
        const response = await axiosInstance.post(RESEND_PHONE_OTP,{}, { headers: {
          Authorization: `Bearer ${token}` || "",
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        }});
    return response.data;
  } catch (error) {
      console.error("Error updating bank details:", error.response || error);
    throw error;
  }
}
