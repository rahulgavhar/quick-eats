import { useSelector } from "react-redux";
import { useEffect } from "react";
import useLonLat from "../hooks/useLonLat";
import Footer from "../components/General/Footer";
import Header from "../components/Guest/GuestHeader";
import MapPicker from "../components/General/MapPicker";
import { userSliceActions } from "../redux/slices/userSlice";
import { useDispatch } from "react-redux";

const Guest = () => {
  const { mode } = useSelector((state) => state.theme);
  const { coords, loading: locLoading, error: locError, refresh } = useLonLat();
  const dispatch = useDispatch();

  // Update coords in Redux store
  useEffect(() => {
    dispatch(userSliceActions.setCoords(coords));
  }, [coords, dispatch]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        mode === "dark"
          ? "bg-linear-to-br from-gray-950 via-gray-900 to-gray-900 text-gray-100"
          : "bg-linear-to-br from-emerald-50 via-white to-cyan-50 text-gray-900"
      }`}
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute -left-10 top-10 h-64 w-64 blur-3xl opacity-50 ${
              mode === "dark" ? "bg-emerald-800" : "bg-emerald-200"
            }`}
          />
          <div
            className={`absolute right-0 -bottom-10 h-72 w-72 blur-3xl opacity-50 ${
              mode === "dark" ? "bg-cyan-800" : "bg-cyan-200"
            }`}
          />
        </div>

        <Header />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16 space-y-12 sm:space-y-16">
          {/* Hero */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center pt-3 sm:pt-6">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-600 font-semibold">
                Quick Eats
              </p>
              <h1
                className={`text-4xl sm:text-5xl font-extrabold leading-tight ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Order quick from nearby restaurants with live tracking.
              </h1>
              <p
                className={`text-lg ${
                  mode === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Large variety of food, quick and secure payments, realtime
                delivery tracking, and trusted by users across the city.
              </p>
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    mode === "dark"
                      ? "bg-emerald-900 text-emerald-200"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  Fast delivery
                </span>
                <span
                  className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    mode === "dark"
                      ? "bg-cyan-900 text-cyan-100"
                      : "bg-cyan-100 text-cyan-800"
                  }`}
                >
                  Realtime status: accepted → preparing → delivered
                </span>
                <span
                  className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    mode === "dark"
                      ? "bg-orange-900 text-orange-100"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  Secure payments
                </span>
              </div>
            </div>

            <div
              className={`rounded-3xl backdrop-blur p-8 space-y-4 border shadow-md ${
                mode === "dark"
                  ? "bg-gray-900/80 border-gray-800"
                  : "bg-white/80 border-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-500 font-semibold">
                    Expected Delivery Time
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    18 min
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    mode === "dark"
                      ? "bg-emerald-900 text-emerald-100"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  Driver en route
                </div>
              </div>
              <div
                className={`flex items-center gap-2 text-sm ${
                  mode === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />{" "}
                Accepted
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 ml-3" />{" "}
                Preparing
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-500 ml-3" />{" "}
                Out for delivery
                <span className="inline-block h-2 w-2 rounded-full bg-gray-300 ml-3" />{" "}
                Delivered
              </div>
              <div className={`rounded-2xl overflow-hidden`}>
                {locLoading ? (
                  <div
                    className={`w-full h-80 ${
                      mode === "dark" ? "bg-gray-800" : "bg-gray-100"
                    } animate-pulse`}
                  />
                ) : (
                  <MapPicker
                    latitude={coords.lat}
                    longitude={coords.lon}
                    onLocationSelect={() => {}}
                    immovable={true}
                  />
                )}
              </div>
              <div className="flex items-center gap-3">
                <p
                  className={`text-sm ${
                    mode === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {locError
                    ? `Location unavailable: ${locError}. Showing a default city view.`
                    : coords.lat && coords.lon
                    ? "Map centered to your current location."
                    : "Fetching your location…"}
                </p>
                <button
                  onClick={refresh}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                    mode === "dark"
                      ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                      : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  Refresh location
                </button>
              </div>
            </div>
          </section>

          {/* Roles */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {["Users", "Restaurant Owners", "Delivery Partners"].map(
              (label) => (
                <div
                  key={label}
                  className={`rounded-2xl border backdrop-blur shadow-sm p-5 space-y-3 ${
                    mode === "dark"
                      ? "bg-gray-900/80 border-gray-800"
                      : "bg-white/80 border-white/70"
                  }`}
                >
                  <p className="text-sm text-emerald-600 font-semibold">
                    For {label}
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Tailored experience
                  </p>
                  <p
                    className={`text-sm ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {label === "Users" &&
                      "Browse nearby restaurants, pay securely, and track your delivery live."}
                    {label === "Restaurant Owners" &&
                      "List menus, manage orders, and monitor statuses in one dashboard."}
                    {label === "Delivery Partners" &&
                      "Get clear tasks, route hints, and fast payout updates."}
                  </p>
                </div>
              )
            )}
          </section>

          {/* Highlights */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div
              className={`rounded-3xl border shadow-md p-8 space-y-5 ${
                mode === "dark"
                  ? "bg-gray-900/80 border-gray-800"
                  : "bg-white border-white"
              }`}
            >
              <h2
                className={`text-2xl font-bold ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                What makes Quick Eats different?
              </h2>
              <ul
                className={`space-y-3 ${
                  mode === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {[
                  "Order quick from nearby restaurants",
                  "Large variety of food",
                  "Quick and secure payments",
                  "Live order status: accepted, preparing, delivered",
                  "Realtime delivery tracking",
                  "Fast delivery",
                  "Trusted by users",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 rounded-full font-semibold text-sm ${
                    mode === "dark"
                      ? "bg-emerald-900 text-emerald-200"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  Secure
                </span>
                <span
                  className={`px-3 py-1 rounded-full font-semibold text-sm ${
                    mode === "dark"
                      ? "bg-cyan-900 text-cyan-200"
                      : "bg-cyan-50 text-cyan-700"
                  }`}
                >
                  Realtime
                </span>
                <span
                  className={`px-3 py-1 rounded-full font-semibold text-sm ${
                    mode === "dark"
                      ? "bg-orange-900 text-orange-200"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  Trusted
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-linear-to-r from-emerald-500 to-cyan-500 text-white p-8 shadow-lg space-y-4">
              <p className="text-sm uppercase font-semibold tracking-wide">
                Delivery timeline
              </p>
              <h3 className="text-2xl font-bold">
                Stay informed at every step.
              </h3>
              <div className="space-y-3 text-white/90">
                <p>Accepted → Preparing → Out for Delivery → Delivered</p>
                <p>
                  Notifications keep users, owners, and delivery partners in
                  sync.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm font-semibold">
                <div className="rounded-2xl bg-white/15 px-4 py-3">
                  Live courier location
                </div>
                <div className="rounded-2xl bg-white/15 px-4 py-3">
                  Smart ETA updates
                </div>
                <div className="rounded-2xl bg-white/15 px-4 py-3">
                  Secure pay flows
                </div>
                <div className="rounded-2xl bg-white/15 px-4 py-3">
                  Fast reorders
                </div>
              </div>
            </div>
          </section>

          {/* Steps */}
          <section
            className={`rounded-3xl border shadow-md p-8 space-y-6 ${
              mode === "dark"
                ? "bg-gray-900/80 border-gray-800"
                : "bg-white border-white"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-600 font-semibold">
                  How it works
                </p>
                <h3
                  className={`text-2xl font-bold ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Tap, cook, deliver, delight.
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                "Browse nearby",
                "Choose & pay",
                "Kitchen updates",
                "Track delivery",
              ].map((step, idx) => (
                <div
                  key={step}
                  className={`p-5 rounded-2xl border ${
                    mode === "dark"
                      ? "bg-gray-800/70 border-gray-700"
                      : "bg-emerald-50/60 border-emerald-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-emerald-600 shadow-sm ${
                        mode === "dark" ? "bg-gray-900" : "bg-white"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs uppercase font-semibold text-emerald-600">
                      Step
                    </span>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      mode === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {step}
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {step === "Browse nearby" &&
                      "Smart sorting by distance, rating, and speed."}
                    {step === "Choose & pay" &&
                      "Secure payments with cards, UPI, and wallets."}
                    {step === "Kitchen updates" &&
                      "Live statuses: accepted, preparing, ready."}
                    {step === "Track delivery" &&
                      "Realtime courier location with fast ETAs."}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl sm:rounded-3xl bg-linear-to-r from-emerald-600 to-cyan-600 text-white p-4 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 shadow-lg">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] font-semibold">
                Ready to taste?
              </p>
              <h3 className="text-3xl font-bold mt-2">
                Join the trusted Quick Eats community.
              </h3>
              <p className="text-white/90 mt-3">
                Sign up to order, list your kitchen, or start delivering today.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <a
                href="/signup"
                className="px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base bg-white text-emerald-700 font-semibold hover:bg-emerald-50 transition"
              >
                Create Account
              </a>
              <a
                href="/signin"
                className="px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base border border-white/60 text-white font-semibold hover:bg-white/10 transition"
              >
                Log In
              </a>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Guest;
