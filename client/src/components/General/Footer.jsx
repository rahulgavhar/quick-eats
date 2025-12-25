import React from "react";
import { useSelector } from "react-redux";

const Footer = () => {
  const { mode } = useSelector((state) => state.theme);

  return (
    <footer
      className={`mt-12 py-8 transition-colors duration-300 ${
        mode === "dark"
          ? "bg-linear-to-r from-gray-800 to-gray-700"
          : "bg-linear-to-r from-green-500 to-teal-500"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
              🍽️ Quick Eats
            </h3>
            <p
              className={`text-sm leading-relaxed transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-green-100"
              }`}
            >
              Your favorite food delivery app. Order delicious meals from top
              restaurants and get them delivered right to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul
              className={`space-y-2 transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-green-100"
              }`}
            >
              <li>
                <a href="#" className="hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Restaurants
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul
              className={`space-y-2 transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-green-100"
              }`}
            >
              <li>
                <a href="#" className="hover:text-white transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
            <ul
              className={`space-y-2 transition-colors duration-300 ${
                mode === "dark" ? "text-gray-300" : "text-green-100"
              }`}
            >
              <li>📞 +1 234 567 890</li>
              <li>📧 support@quickeats.com</li>
              <li>📍 123 Food Street, Foodie City</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a
                href="#"
                className={`text-2xl hover:text-white transition ${
                  mode === "dark" ? "text-gray-300" : "text-green-100"
                }`}
              >
                📘
              </a>
              <a
                href="#"
                className={`text-2xl hover:text-white transition ${
                  mode === "dark" ? "text-gray-300" : "text-green-100"
                }`}
              >
                🐦
              </a>
              <a
                href="#"
                className={`text-2xl hover:text-white transition ${
                  mode === "dark" ? "text-gray-300" : "text-green-100"
                }`}
              >
                📷
              </a>
            </div>
          </div>
        </div>

        <div
          className={`mt-8 pt-6 border-t text-center transition-colors duration-300 ${
            mode === "dark"
              ? "border-gray-700 text-gray-400"
              : "border-green-400 text-green-100"
          }`}
        >
          <p>© 2024 Quick Eats. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
