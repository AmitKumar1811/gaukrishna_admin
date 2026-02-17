import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../Firebase";
// import { getFirebaseErrorMessage } from "../Firebase/fireBaseHandler";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate, token]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(
          /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
          "Enter a valid email address"
        )
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true); // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUser = {
          uid: "dummy-user-123",
          email: values.email,
          displayName: "Admin User",
        };
        const mockToken = "dummy-firebase-token-12345";

        console.log("Mock Login Successful");

        dispatch(
          setCredentials({
            token: mockToken,
            user: mockUser,
          })
        );
        toast.success("Login successful");
        navigate("/");
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error(err);
        toast.error("Login failed. Please check your credentials.");
      }
    },
  });

  return (
    <div
      className="flex flex-col justify-between h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/smart-remote.png')",
      }}
    >
      {/* Overlay to ensure text is readable */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-5 md:p-15 gap-5 md:gap-8">
        <div className="flex gap-2 mb-4">
          {/* Logo placeholder or use actual logo with white filter if needed */}
          <img className="max-w-70 drop-shadow-lg" src="/smartLogo.svg" alt="Logo" />
          {/* <h1 className="text-4xl font-bold text-white tracking-wide">SMART TV <span className="text-[#9900FF] bg-white px-2 rounded">ADMIN</span></h1> */}
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 md:p-10 gap-6 flex flex-col rounded-[24px] w-full max-w-md shadow-2xl border border-white/20">
          <div className="flex flex-col gap-2 text-center">
            <div className="text-2xl font-bold text-gray-800">Welcome Back</div>
            <div className="text-sm text-gray-500 font-medium">
              Please sign in to your admin account
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1">
              <input
                type="text"
                name="email"
                placeholder="Email Address"
                className={`text-gray-700 bg-gray-50 w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9900FF] transition-all
                  ${formik.touched.email && formik.errors.email ? "border-red-500 bg-red-50" : "border-gray-200"}
                `}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs ml-2 font-medium">{formik.errors.email}</p>
              )}
            </div>

            <div className="space-y-1 relative">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`text-gray-700 bg-gray-50 w-full p-4 border rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-[#9900FF] transition-all
                    ${formik.touched.password && formik.errors.password ? "border-red-500 bg-red-50" : "border-gray-200"}
                  `}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                {/* eye icon toggle */}
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </span>
              </div>

              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs ml-2 font-medium">{formik.errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="text-white cursor-pointer text-[15px] font-semibold bg-[#9900FF] p-4 rounded-xl w-full mt-4 hover:bg-[#7f00d4] active:scale-95 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      <div className="relative z-10 flex justify-center py-6">
        <div className="text-xs font-medium text-white/60">© 2026 Admin Dashboard. All rights reserved.</div>
      </div>
    </div>
  );
};

export default Login;
