import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendOTP, verifyOTP, getCurrentUser } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import { API } from "../api/api";
import { Boxes, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      {/* Background radial soft light orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 bg-bg-card p-8 border border-border-primary rounded-2xl shadow-premium dark:shadow-premium-dark relative z-10"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 bg-accent-purple/10 text-accent-purple rounded-xl border border-accent-purple/20 mb-4.5">
            <Boxes className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-medium tracking-tight text-text-primary">
            Sign in to AssetFlow
          </h2>
          <p className="mt-1 text-[10px] text-text-muted font-medium uppercase tracking-widest">
            Enterprise Asset Management
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form 
              key="email-step"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="space-y-5" 
              onSubmit={handleSendOTP}
            >
              <Input
                label="Work Email Address"
                id="email-address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full py-2.5"
              >
                {loading ? "Sending Code..." : "Continue with Email"}
              </Button>

              <div className="relative my-6 flex items-center">
                <div className="flex-grow border-t border-border-primary"></div>
                <span className="flex-shrink mx-4 text-[9px] text-text-muted font-semibold uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-border-primary"></div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleGoogleSign}
                className="w-full py-2.5 flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </Button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-step"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6" 
              onSubmit={handleVerifyOTP}
            >
              <div className="space-y-4 text-center">
                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                  We sent a 6-digit confirmation code to <br />
                  <span className="text-text-primary font-semibold">{email}</span>
                </p>
                
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-48 text-center text-xl font-bold tracking-[8px] py-2.5 px-3 bg-bg-secondary border border-border-primary rounded-lg focus:border-accent-purple/80 focus:ring-2 focus:ring-accent-purple/20 outline-none text-text-primary transition-all mx-auto block"
                  placeholder="000000"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full py-2.5"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
                
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-[11px] text-text-muted hover:text-text-primary font-medium text-center mt-2.5 transition-colors cursor-pointer"
                >
                  Change Email Address
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
