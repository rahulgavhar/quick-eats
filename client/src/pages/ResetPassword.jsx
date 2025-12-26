import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { MdLightMode, MdDarkMode } from "react-icons/md";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/slices/themeSlice.js';

const ResetPassword = () => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    const newErrors = { ...errors };

    if (name === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = 'Email is invalid';
      } else {
        delete newErrors.email;
      }
    }

    if (name === 'otp') {
      if (value && !/^\d*$/.test(value)) {
        newErrors.otp = 'OTP must contain only digits';
      } else if (value && value.length !== 6) {
        newErrors.otp = 'OTP must be 6 digits';
      } else {
        delete newErrors.otp;
        // Auto-submit when 6 digits are entered
        setTimeout(() => handleVerifyOTP(value), 300);
      }
    }

    if (name === 'newPassword') {
      if (!value) {
        newErrors.newPassword = 'Password is required';
      } else if (value.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      } else {
        delete newErrors.newPassword;
      }

      // Also validate confirm password if it has a value
      if (formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
      }
    }

    if (name === 'confirmPassword') {
      if (!value) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.newPassword !== value) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    try {
      await axios.post(`${apiURL}/api/auth/reset-password/send-otp`, {
        email: formData.email
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      toast.success('OTP sent to your email!');
      setStep(2);
      setErrors({});
    } catch (error) {
      if(error?.response?.data?.code==='OTP_ALREADY_EXISTS'){
        toast.info('An OTP has already been sent to your email. Please check your inbox.');
        setStep(2);
        setErrors({});
        return;
      }
      if (error?.response?.data?.code === 'OTP_ALREADY_VERIFIED') {
        toast.info('Your email is already verified.');
        setStep(3);
        setErrors({});
        return;
      }
      if (error?.response?.data?.code === 'SESSION_EXPIRED') {
        toast.info('Your session has expired. Please try again.');
        setStep(1);
        setErrors({});
        return;
      }
      const message = error?.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${apiURL}/api/auth/reset-password/resend-otp`, {
        email: formData.email
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      toast.success('OTP resent to your email!');
    } catch (error) {
      if (error?.response?.data?.code === 'OTP_ALREADY_VERIFIED') {
        toast.info('Your email is already verified.');
        setStep(3);
        setErrors({});
        return;
      }
      if (error?.response?.data?.code === 'SESSION_EXPIRED') {
        toast.info('Your session has expired. Please try again.');
        setStep(1);
        setErrors({});
        return;
      }
      const message = error?.response?.data?.message || 'Failed to resend OTP. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue = formData.otp) => {
    if (!otpValue || otpValue.length !== 6) return;

    setLoading(true);
    try {
      await axios.post(`${apiURL}/api/auth/reset-password/verify-otp`, {
        email: formData.email,
        otp: otpValue
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      toast.success('OTP verified successfully!');
      setStep(3);
      setErrors({});
    } catch (error) {
      const message = error?.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(message);
      setFormData(prev => ({ ...prev, otp: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      await axios.post(`${apiURL}/api/auth/reset-password/reset`, {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      toast.success('Password reset successfully!');
      navigate('/signin');
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Clear OTP when going back from Step 2
    if(step===2){
      setFormData(prev => ({ ...prev, otp: '' }));
    }
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    } else {
      navigate('/signin');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden transition-colors duration-300 ${
      mode === "dark"
        ? "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-linear-to-br from-green-50 via-emerald-50 to-teal-50"
    }`}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="absolute top-6 right-6 p-2 rounded-full bg-transparent transition-all duration-300 hover:opacity-80"
        title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {mode === "dark" ? (
          <MdLightMode size={24} className="text-yellow-400" />
        ) : (
          <MdDarkMode size={24} className="text-gray-700" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 transition mb-4 bg-transparent focus:outline-none ${
              mode === "dark"
                ? "text-green-400 hover:text-green-300"
                : "text-green-600 hover:text-green-700"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base font-medium">Back</span>
          </button>

          <div className="text-center">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 transition-colors duration-300 ${
              mode === "dark" ? "text-green-400" : "text-green-800"
            }`}>
              Quick Eats
            </h1>
            <p className={`text-sm sm:text-base px-4 transition-colors duration-300 ${
              mode === "dark" ? "text-green-300" : "text-green-600"
            }`}>
              Reset your password
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className={`rounded-2xl shadow-2xl p-6 sm:p-8 transition-colors duration-300 ${
          mode === "dark"
            ? "bg-gray-800 text-white"
            : "bg-white"
        }`}>
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6 sm:mb-8 max-w-xs mx-auto">
            {[1, 2, 3].map((num) => (
              <div key={num} className={`flex items-center ${num < 3 ? 'flex-1' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                    step >= num
                      ? 'bg-green-600 text-white'
                      : mode === "dark"
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {num}
                </div>
                {num < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition ${
                      step > num ? 'bg-green-600' : mode === "dark" ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center transition-colors duration-300 ${
                mode === "dark" ? "text-green-400" : "text-green-800"
              }`}>
                Enter Your Email
              </h2>

              <p className={`text-sm sm:text-base mb-6 text-center transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}>
                We'll send you a code to verify your identity
              </p>

              <div className="space-y-5">
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-300 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none transition ${
                        errors.email
                          ? 'border-red-500 focus:border-red-500'
                          : mode === "dark"
                          ? 'border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400'
                          : 'border-gray-200 focus:ring-2 focus:ring-green-500'
                      }`}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className={`w-full text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    mode === "dark"
                      ? "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  }`}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center transition-colors duration-300 ${
                mode === "dark" ? "text-green-400" : "text-green-800"
              }`}>
                Enter OTP
              </h2>

              <p className={`text-sm sm:text-base mb-6 text-center transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}>
                Enter the 6-digit code sent to<br />
                <span className="font-semibold text-gray-800">{formData.email}</span>
              </p>

              <div className="space-y-6">
                {/* 6 Digit Input Boxes */}
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-4 text-center transition-colors duration-300 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    OTP <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 sm:gap-3 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={formData.otp[index] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!/^\d*$/.test(value)) return; // Only allow digits
                          
                          const otpArray = formData.otp.split('');
                          otpArray[index] = value;
                          const newOtp = otpArray.slice(0, 6).join('');
                          
                          setFormData(prev => ({ ...prev, otp: newOtp }));
                          
                          // Auto-focus next box
                          if (value && index < 5) {
                            const nextInput = document.getElementById(`otp-${index + 1}`);
                            if (nextInput) nextInput.focus();
                          }
                          
                          // Auto-submit when all 6 digits are filled
                          if (newOtp.length === 6) {
                            setTimeout(() => handleVerifyOTP(newOtp), 300);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Allow backspace to go to previous box
                          if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
                            const prevInput = document.getElementById(`otp-${index - 1}`);
                            if (prevInput) prevInput.focus();
                          }
                        }}
                        id={`otp-${index}`}
                        className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg border-0 border-gray-200 focus:border-green-600 focus:ring-1 focus:ring-green-500 focus:outline-none transition ${
                          mode === "dark"
                            ? "bg-gray-700 text-white placeholder-gray-500"
                            : "bg-white text-gray-800 placeholder-gray-400"
                        }`}
                        placeholder="-"
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="text-red-500 text-xs mt-2 text-center">{errors.otp}</p>
                  )}
                </div>

                {/* Resend OTP Button */}
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className={`w-full text-sm sm:text-base font-semibold py-2 transition ${
                    mode === "dark"
                      ? "text-green-400 hover:text-green-300 bg-transparent focus:outline-none border-2 border-green-400 hover:border-green-300 rounded-lg"
                      : "text-green-600 hover:text-green-700 bg-transparent focus:outline-none border-2 border-green-600 hover:border-green-700 rounded-lg"
                  }`}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {/* Step 3: Password Reset */}
          {step === 3 && (
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center transition-colors duration-300 ${
                mode === "dark" ? "text-green-400" : "text-green-800"
              }`}>
                Create New Password
              </h2>

              <p className={`text-sm sm:text-base mb-6 text-center transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-gray-600"
              }`}>
                Enter your new password
              </p>

              <div className="space-y-5">
                {/* New Password */}
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-300 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 focus:outline-none transition ${
                        errors.newPassword
                          ? 'border-red-500 focus:border-red-500'
                          : mode === "dark"
                          ? 'border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400'
                          : 'border-gray-200 focus:ring-2 focus:ring-green-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent transition-colors duration-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-2 transition-colors duration-300 ${
                    mode === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 focus:outline-none transition ${
                        errors.confirmPassword
                          ? 'border-red-500 focus:border-red-500'
                          : mode === "dark"
                          ? 'border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-green-400'
                          : 'border-gray-200 focus:ring-2 focus:ring-green-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none bg-transparent transition-colors duration-300 ${
                        mode === "dark"
                          ? "text-gray-500 hover:text-gray-400"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className={`w-full text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    mode === "dark"
                      ? "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  }`}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step Description */}
        {/* Footer */}
        <div className={`mt-4 sm:mt-6 text-center text-xs sm:text-sm px-4 transition-colors duration-300 ${
          mode === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          {step === 1 && <p>Step 1 of 3: Verify your email</p>}
          {step === 2 && <p>Step 2 of 3: Confirm OTP</p>}
          {step === 3 && <p>Step 3 of 3: Set new password</p>}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
