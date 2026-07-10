import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/AxiosInstance";
import { LOGIN } from "../../services/Admin/adminEndPoints";

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
        setLoading(true);
        const response = await api.post(LOGIN, {
          email: values.email,
          password: values.password,
        });

        const { user, accessToken, refreshToken } = response.data;

        dispatch(
          setCredentials({
            token: accessToken,
            refreshToken: refreshToken,
            user: user,
          })
        );

        toast.success("Login successful");
        navigate("/", { replace: true });
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error(err);
        toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
      }
    },
  });

  return (
    <div className="min-h-screen flex w-full bg-white font-sans selection:bg-brand-200 selection:text-brand-900">
      <div className="hidden lg:flex w-1/2 bg-brand-950 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600/30 blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold-600/20 blur-[120px] mix-blend-screen"></div>

          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRlcm4gaWQ9InNtYWxsR3JpZCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNMTAgMEwwIDBMMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI3NtYWxsR3JpZCkiLz48cGF0aCBkPSJNNDAgMEwwIDBMMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 z-0"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <img src="/sidebar.png" className="h-32 object-contain" alt="GauKrishna" />
          </div>

          <div className="mb-20">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Pure by <span className="text-gold-400">Nature.</span>
            </h1>
            <p className="text-lg text-brand-100/80 max-w-md font-medium leading-relaxed">
              Manage your premium organic products, monitor orders, and deliver health and well-being to your customers seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-4 text-brand-200/60 text-sm font-medium">
            <div className="w-8 h-px bg-brand-200/30"></div>
            © 2026 GauKrishna Admin
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-white relative">
        <div className="lg:hidden absolute top-8 w-full flex justify-center">
          <img src="/logo.png" className="h-14 object-contain" alt="GauKrishna" />
        </div>
        <div className="w-full max-w-[420px] animate-slide-up mt-16 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-500 font-medium text-[15px]">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-slate-400 w-[18px] h-[18px] group-focus-within:text-brand-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="email"
                  placeholder="Enter your email"
                  className={`w-full py-3.5 pl-11 pr-4 text-[15px] text-slate-900 bg-white border-2 rounded-xl focus:outline-none transition-all placeholder:text-slate-400 shadow-sm
                    ${formik.touched.email && formik.errors.email ? "border-rose-300 focus:border-rose-500 shadow-rose-100" : "border-slate-200 focus:border-brand-600 hover:border-slate-300"}
                  `}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-rose-500 text-[13px] font-medium flex items-center gap-1 animate-fade-in mt-1">
                  <span className="w-1 h-1 rounded-full bg-rose-500"></span> {formik.errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-slate-400 w-[18px] h-[18px] group-focus-within:text-brand-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className={`w-full py-3.5 pl-11 pr-12 text-[15px] text-slate-900 bg-white border-2 rounded-xl focus:outline-none transition-all placeholder:text-slate-400 shadow-sm
                    ${formik.touched.password && formik.errors.password ? "border-rose-300 focus:border-rose-500 shadow-rose-100" : "border-slate-200 focus:border-brand-600 hover:border-slate-300"}
                  `}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-rose-500 text-[13px] font-medium flex items-center gap-1 animate-fade-in mt-1">
                  <span className="w-1 h-1 rounded-full bg-rose-500"></span> {formik.errors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-[14px] text-slate-600 font-medium cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting || loading}
              className="relative w-full mt-4 py-4 px-4 bg-brand-950 hover:bg-brand-900 text-white text-[15px] font-bold rounded-xl shadow-lg shadow-brand-900/20 active:scale-[0.98] transition-all overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </span>
            </button>
          </form>

          <div className="mt-10 text-center lg:hidden text-[12px] font-medium text-slate-400">
            © 2026 GauKrishna Admin
          </div>
        </div>
      </div>

      {/* Embedded CSS for shimmer animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default Login;
