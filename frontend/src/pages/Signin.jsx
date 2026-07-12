import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendOTP, verifyOTP, getCurrentUser } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import { API } from "../api/api";
import { Boxes } from "lucide-react";

export default function Signin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [transactionID, setTransactionID] = useState(null);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    document.title = "Sign In — AssetFlow";
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const response = await dispatch(sendOTP(email)).unwrap();
      setTransactionID(response.transactionID);
      setStep("otp");
      toast.success("Verification code sent to your email");
    } catch (err) {
      toast.error(err || "Failed to send verification code");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.warning("Please enter complete 6-digit verification code");
      return;
    }

    try {
      await dispatch(
        verifyOTP({
          OTP: otp,
          transactionID,
        })
      ).unwrap();

      toast.success("Signed in successfully!");
      dispatch(getCurrentUser());
      navigate("/dashboard");
    } catch (err) {
      toast.error(err || "Verification code is incorrect");
    }
  };

  const handleGoogleSign = () => {
    window.location.href = `${API}/auth/google/login`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-slate-200 rounded shadow-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 rounded bg-blue-50 text-blue-600 mb-4">
            <Boxes className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to AssetFlow
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Enterprise Asset & Resource Planner
          </p>
        </div>

        {step === "email" ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Work Email Address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-sm text-slate-800"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex justify-center py-2.5 text-sm font-semibold tracking-wide cursor-pointer disabled:opacity-50"
              >
                {loading ? "Sending Code..." : "Continue"}
              </button>
            </div>

            <div className="relative my-6 flex items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-400 font-bold uppercase">or</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSign}
              className="w-full btn-secondary flex items-center justify-center gap-3 py-2 text-sm font-semibold cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.435-2.88-6.435-6.435s2.88-6.435 6.435-6.435c1.644 0 3.13.617 4.27 1.62l3.056-3.056C19.16 2.378 15.93.824 12.24.824 5.952.824.824 5.952.824 12.24s5.128 11.416 11.416 11.416c6.288 0 11.416-5.128 11.416-11.416 0-.824-.103-1.648-.288-2.472H12.24z"
                />
              </svg>
              Sign in with Google
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-500 font-medium">
                We sent a 6-digit code to <strong className="text-slate-700">{email}</strong>
              </p>
              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="jira-input w-48 text-center text-xl font-bold tracking-[8px] py-2 px-3 mx-auto"
                  placeholder="000000"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex justify-center py-2.5 text-sm font-semibold tracking-wide cursor-pointer disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-xs text-blue-600 hover:underline font-bold text-center mt-2"
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
