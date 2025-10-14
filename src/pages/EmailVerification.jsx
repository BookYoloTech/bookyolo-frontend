import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Bookyolo-logo.jpg';

export default function EmailVerification() {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            className="h-12 w-auto"
            src={logo}
            alt="BookYolo"
          />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-gray-200 py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Email Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
              <svg
                className="h-8 w-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Please check your email and verify your BookYolo account
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              We've sent a verification link to your email address. Click the link in the email to activate your account and start using BookYolo.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleBackToLogin}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors cursor-pointer"
              >
                Back to Login
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>
                Didn't receive the email? Check your spam folder or contact support if you continue to have issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
