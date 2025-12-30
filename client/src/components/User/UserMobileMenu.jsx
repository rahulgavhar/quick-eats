import { ImSpoonKnife } from "react-icons/im";
import {
  MdLightMode,
  MdDarkMode,
  MdPerson,
  MdReceipt,
  MdSettings,
  MdLogout,
  MdLocationOn,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { useNavigate } from "react-router-dom";
import Popup from "reactjs-popup";

const MobileMenu = ({
  showMobileMenu,
  setShowMobileMenu,
  cart,
  setShowCart,
  handleLogout,
  setToDeveloperLocation,
  setToCurrentLocation,
  city,
}) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  if (!showMobileMenu) return null;

  return (
    <div
      className={`md:hidden fixed top-22 left-0 right-0 z-30 shadow-lg transition-all duration-300 ${
        mode === "dark"
          ? "bg-gray-800 border-b border-gray-700 text-white"
          : "bg-white border-b border-gray-200 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Theme</span>
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`hover:opacity-80 transition bg-transparent ${
              mode === "dark" ? "text-white" : "text-gray-900"
            }`}
            title={
              mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {mode === "dark" ? (
              <MdLightMode size={24} />
            ) : (
              <MdDarkMode size={24} />
            )}
          </button>
        </div>

        <Popup
          trigger={(
            <button
              className={`w-full flex items-center justify-between px-4 py-3 rounded ${
                mode === "dark"
                  ? "bg-gray-800 hover:bg-gray-600"
                  : "bg-teal-50 hover:bg-teal-100"
              }`}
            >
              <span
                className={`font-semibold flex items-center gap-2 ${
                  mode === "dark" ? "text-teal-400" : "text-teal-700"
                }`}
              >
                <MdLocationOn size={18} /> Change Location
              </span>
            </button>
          )}
          position="bottom center"
          closeOnDocumentClick
          arrow={false}
        >
          {(close) => (
            <div
              className={`p-4 rounded-lg shadow-lg w-72 ${
                mode === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
            >
              <p className="font-semibold mb-3 text-center">Select your location</p>
              <div className="space-y-2">
                <button
                  className="w-full px-3 py-2 rounded-md bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                  onClick={() => {
                    setToDeveloperLocation(close);
                    setShowMobileMenu(false);
                  }}
                >
                  Developer's location (Panvel)
                </button>
                <button
                  className="w-full px-3 py-2 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
                  onClick={() => {
                    setToCurrentLocation(close);
                    setShowMobileMenu(false);
                  }}
                >
                  Use current
                </button>
              </div>
            </div>
          )}
        </Popup>

        <button
          onClick={() => {
            setShowCart(true);
            setShowMobileMenu(false);
          }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded ${
            mode === "dark"
              ? "bg-gray-800 hover:bg-gray-600"
              : "bg-green-50 hover:bg-green-100"
          }`}
        >
          <span
            className={`font-semibold flex items-center gap-2 ${
              mode === "dark" ? "text-green-500" : "text-green-700"
            }`}
          >
            <ImSpoonKnife size={18} /> View Cart
          </span>
          {cart.length > 0 && (
            <span className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {cart.length}
            </span>
          )}
        </button>

        <div className="grid grid-cols-1 gap-2">
          <button
            className={`text-left px-4 py-3 rounded flex items-center gap-2 ${
              mode === "dark"
                ? "hover:bg-green-600 bg-gray-800 text-white"
                : "hover:bg-green-100"
            }`}
            onClick={() => {
              setShowMobileMenu(false);
              navigate("/profile");
            }}
          >
            <MdPerson size={20} /> My Profile
          </button>
          <button
            className={`text-left px-4 py-3 rounded flex items-center gap-2 ${
              mode === "dark"
                ? "hover:bg-green-600 bg-gray-800 text-white"
                : "hover:bg-green-100"
            }`}
            onClick={() => setShowMobileMenu(false)}
          >
            <MdReceipt size={20} /> My Orders
          </button>
          <button
            className={`text-left px-4 py-3 rounded flex items-center gap-2 ${
              mode === "dark"
                ? "hover:bg-green-600 bg-gray-800 text-white"
                : "hover:bg-green-100"
            }`}
            onClick={() => setShowMobileMenu(false)}
          >
            <MdSettings size={20} /> Settings
          </button>
          <button
            className={`text-left px-4 py-3 rounded flex items-center gap-2 ${
              mode === "dark"
                ? "text-red-300 hover:bg-red-600 hover:text-white bg-gray-800"
                : "text-red-600 hover:bg-red-100"
            }`}
            onClick={() => {
              handleLogout();
              setShowMobileMenu(false);
            }}
          >
            <MdLogout size={20} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
