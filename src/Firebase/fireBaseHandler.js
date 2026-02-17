// utils/firebaseErrorHandler.js
export const getFirebaseErrorMessage = (error) => {
  switch (error.code) {
    case "auth/invalid-email":
      return "Invalid email address";

    case "auth/user-not-found":
      return "No account found with this email";

    case "auth/wrong-password":
      return "Incorrect password";

    case "auth/invalid-credential":
      return "Invalid login credentials";

    case "auth/user-disabled":
      return "This account has been disabled";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection";

    default:
      return error.message || "Something went wrong";
  }
};
