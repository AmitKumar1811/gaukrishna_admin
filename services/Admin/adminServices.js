import axiosInstance from "../AxiosInstance";
import { MEDICINES, BANKING_DETAILS, PROFILE,CATEGORIES, FILES, KYC, ORDERS, COUPONS, DOCTOR, PHARMACY, DARKSTORE, USERS, DASHBOARD, PROMOTION  } from "../../services/Admin/adminEndPoints";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
 
const token = Cookies.get("auth_token"); 

// ✅ Get Pharmacy Profile
export const getPharmacyProfile = async () => {
  try {
    const response = await axiosInstance.get(`admin/profile`);
    console.log("✅ Profile fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching profile:", error.response || error);
    throw error;
  }
};


// ✅ Update Pharmacy Profile
export const updatePharmacyProfile = async (data) => {
  try {
    const response = await axiosInstance.put(`admin/edit`, data);
    console.log("✅ Profile updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating profile:", error.response || error);
    throw error;
  }
};

// ✅ Get all medicines
export const getMedicines = async (page) => {
  try {
    const response = await axiosInstance.get(`${MEDICINES}?page=${page}&limit=${10}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching medicines:", error);
    throw error;
  }
};

export const getCategories = async (page,limit,search) => {
  try {
    const response = await axiosInstance.get(`${CATEGORIES}?page=${page}&limit=${limit}${search? `&search=${search}`:""}`);
    return response.data.data; // extract array directly
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    throw error;
  }
};
export const getCategoryById = async (id) => {
  try {
    const response = await axiosInstance.get(`${CATEGORIES}/details?categoryId=${id}`);
    return response.data.data; // extract array directly
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    throw error;
  }
};
export const deleteCategories = async (id) => {
  try {
    const response = await axiosInstance.delete(`${CATEGORIES}?categoryId=${id}`);
    return response.data.data; // extract array directly
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    throw error;
  }
};

export const addNewCategory = async (data) => {
  try {
    const response = await axiosInstance.post(`${CATEGORIES}`,data);
    return response.data.data; // extract array directly
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    throw error;
  }
};
export const updateCategory = async (data) => {
  try {
    const response = await axiosInstance.put(`${CATEGORIES}`,data);
    return response.data.data; // extract array directly
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    throw error;
  }
};







// ✅ Add new medicine
export const addMedicine = async (data) => {
  try {
    const token = localStorage.getItem("statemedAdmin");
    const headers = {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    };

    const response = await axiosInstance.post(MEDICINES, data, { headers });
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) throw new Error("exists");
    if (error.response?.status === 404) throw new Error("notfound");
    if (error.response?.status === 401) throw new Error("unauthorized");
    throw error;
  }
};





// ✅ Get medicine details by ID
export const getMedicineById = async (medicineId) => {
  try {
    const response = await axiosInstance.get(`${MEDICINES}/details?medicineId=${medicineId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine details:", error.response || error);
    throw error;
  }
};

export const addNewMedicines = async (data) => {
  try {
    const response = await axiosInstance.post(`${MEDICINES}`,data);
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine details:", error.response || error);
    throw error;
  }
};

export const updateMedicines = async (data) => {
  try {
    const response = await axiosInstance.put(`${MEDICINES}`,data);
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine details:", error.response || error);
    throw error;
  }
};
export const deleteMedicines = async (data) => {
  try {
    const response = await axiosInstance.delete(`${MEDICINES}`,data);
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine details:", error.response || error);
    throw error;
  }
};















// ✅ Add new bank details
export const addBankDetails = async (data) => {
  try {
    const response = await axiosInstance.post(BANKING_DETAILS, data,{ headers: {
          Authorization: `Bearer ${token}` || "",
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        }});
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error("exists");
    } else if (error.response?.status === 404) {
      throw new Error("notfound");
    }
    throw error;
  }
};

// ✅ Get existing banking details
export const getBankDetails = async () => {
  try {
    const response = await axiosInstance.get(BANKING_DETAILS);
    console.log("✅ Banking details response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching bank details:", error.response || error);
    throw error;
  }
};

// ✅ Update existing banking details
export const updateBankDetails = async (data) => {
  try {
    const response = await axiosInstance.put(BANKING_DETAILS, data);
    return response.data;
  } catch (error) {
    console.error("Error updating bank details:", error.response || error);
    throw error;
  }
};



export const uploadFile = async (data) => {
  try {
    const response = await axiosInstance.post(FILES, data);
    return response.data;
  } catch (error) {
    console.error("Error updating bank details:", error.response || error);
        toast.error(error)
    throw error;

  }
};




//orders  
export const getOrders = async (data) => {
  try {
    const response = await axiosInstance.get(ORDERS, data);
    return response.data;
  } catch (error) {
    console.error("Error updating bank details:", error.response || error);
    throw error;
  }
};

export const getOrderByid = async (id) => {
  try {
    const response = await axiosInstance.get(`${ORDERS}/details?ordersId=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error updating bank details:", error.response || error);
    throw error;
  }
};

export const cancelOrder = async (data) => {
  try {
    const response = await axiosInstance.put(`${ORDERS}/cancel`,data);
    return response.data;
  } catch (error) {
    console.error("Error updating bank details:", error.response || error);
    throw error;
  }
};





//coupons
export const getCoupon = async (currentPage) => {
  try {
    const response = await axiosInstance.get(`${COUPONS}?page=${currentPage}&limit=10`); 
    console.log("✅ Coupons fetched:");
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};

export const addCoupon = async (data) => {
  try {
    const response = await axiosInstance.post(`${COUPONS}`,data); 
    console.log("✅ Coupon added:");
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
//delete coupon
export const deleteCoupon = async (couponId) => {
  try {
    const response = await axiosInstance.delete(`${COUPONS}?couponId=${couponId}`); 
    return response.data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  } }
  //get by id
  
export const getCouponid = async (id) => {
  try {
    const response = await axiosInstance.get(`${COUPONS}/details?couponId=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error updating bank details:", error.response || error);
    throw error;
  }
};

export const updateCouponid = async (data) => {
  try {
    const response = await axiosInstance.put(`${COUPONS}`,data);
    return response.data;
  } catch (error) {
    console.error("Error updating bank details:", error.response || error);
    throw error;
  }
};

export const changeCouponStatus = async (data) => {
  try {
    const response = await axiosInstance.put(`${COUPONS}/toggle-status`,data);
    return response.data;
  } catch (error) {
    console.error("Error updating bank details:", error.response || error);
    throw error;
  }
};


//logout

export const getDoctor = async (page,limit,search) => {
  try {
    const response = await axiosInstance.get(`${DOCTOR}?page=${page}&limit=${limit}&search=${search}`); 

    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};


export const getDoctorById = async (id) => {
  try {
    const response = await axiosInstance.get(`${DOCTOR}/details?doctorId=${id}`); 

    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};

export const updateDoctor = async (data) => {
  try {
    const response = await axiosInstance.put(`${DOCTOR}`,data); 

    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};

export const creatDoctor = async (data) => {
  try {
    const response = await axiosInstance.post(`${DOCTOR}`,data); 

    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const deleteDoctor = async (data) => {
  console.log("backedn",data)
  try {
 
       const response = await axiosInstance.delete(`${DOCTOR}`, {
      data: data, // 🔥 body goes here
    });   

    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};



//PHARMCAY
export const getPharmacy = async (page,limit,search) => {
  try {
    const response = await axiosInstance.get(`${PHARMACY}?page=${page}&limit=${limit}&search=${search}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const getPharmacyById = async (id) => {
  try {
    const response = await axiosInstance.get(`${PHARMACY}/details?pharmacyId=${id}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const updatePharmacyStatus=async(payload) => {
  try {
    const response = await axiosInstance.put(`${PHARMACY}`,payload); 
    return response.data;
  } catch (error) {
    console.error("Error fetching pharmacy:", error);
    throw error;
  } 
};







//darkstore
export const getDarkStore = async (page,limit,search) => {
  try {
    const response = await axiosInstance.get(`${DARKSTORE}?page=${page}&limit=${limit}&search=${search}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const getDarkStoreById = async (id) => {
  try {
    const response = await axiosInstance.get(`${DARKSTORE}/details?darkStoreId=${id}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const createDarkStore = async (data) => {
  try {
    const response = await axiosInstance.post(`${DARKSTORE}`,data); 

    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const editDarkStore = async (data) => {
  try {
    const response = await axiosInstance.put(`${DARKSTORE}`,data); 

    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const deleteDarkStore = async (data) => {

  try {
 
       const response = await axiosInstance.delete(`${DARKSTORE}`, {
      data: data, // 🔥 body goes here
    });   

    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};



//getusers
export const getUsers = async (page,limit,activeTab,search) => {
  try {
    const response = await axiosInstance.get(`${USERS}/users?page=${page}&limit=${limit}&userType=${activeTab}&search=${search}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`${USERS}/getUser?_id=${id}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};

export const handleStatusUser = async (id) => {
  try {
    const response = await axiosInstance.put(`${USERS}/enableDisableUser?_id=${id}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};

export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`${USERS}/deleteUser?_id=${id}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};






 
export const getDashboard = async () => {
  try {
    const response = await axiosInstance.get(`${DASHBOARD}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};


//get permotn
export const getPermotion = async (page,limit) => {
  try {
    const response = await axiosInstance.get(`${PROMOTION}?page=${page}&limit=${limit}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const getPermotionById = async (id) => {
  try {
    const response = await axiosInstance.get(`${PROMOTION}/details?promotionId=${id}`); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};

export const updatePermotion = async (data) => {
  try {
    const response = await axiosInstance.put(`${PROMOTION}`,data); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const addPermotion = async (data) => {
  try {
    const response = await axiosInstance.post(`${PROMOTION}`,data); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};
export const deletePermotion = async (data) => {
  try {
    const response = await axiosInstance.delete(`${PROMOTION}`,{data}); 
    return response.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  } 
};

