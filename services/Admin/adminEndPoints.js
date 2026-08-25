// ✅ pharmacyEndpoints.js
export const MEDICINES = "/pharmacy/medicines";
export const BANKING_DETAILS = "/pharmacy/banking-details";
export const PROFILE = "/admin/profile";
export const CATEGORIES = "/categories";
export const FILES = "/file-upload";
export const KYC = "/pharmacy/kyc";
export const ORDERS = "/admin/orders";
export const COUPONS = "/admin/coupons";
export const orderById = (id) => `${ORDERS}/${id}`;
export const orderStatus = (id) => `${ORDERS}/${id}/status`;
export const orderShipment = (id) => `${ORDERS}/${id}/delhivery/shipment`;
export const orderTrack = (id) => `${ORDERS}/${id}/delhivery/track`;
export const orderLabel = (id) => `${ORDERS}/${id}/delhivery/label`;
export const DOCTOR = "/admin/doctors";
export const PHARMACY = "/admin/pharmacy";
export const DARKSTORE = "/admin/darkstores";
export const USERS = "/users";
export const DASHBOARD = "/admin/stats";
export const PROMOTION = "/admin/promotions";
export const PRODUCTS = "/products";
export const BLOGS = "/admin/blogs";
export const TRANSACTIONS = "/admin/transactions";
export const LOGIN = "/auth/login";

