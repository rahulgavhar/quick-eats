import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { userSliceActions } from '../redux/slices/userSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Checkout = () => {
  const { mode } = useSelector((state) => state.theme);
  const { userData, cartItems, coords, city } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Get delivery location from Redux store
  const deliveryLocation = {
    lat: coords?.lat || 20.5937,
    lon: coords?.lon || 78.9629,
    address: userData?.address?.street && userData?.address?.city
      ? `${userData.address.street}, ${userData.address.city}`
      : userData?.address?.street || userData?.address?.city || userData?.address || city || 'Use Latitude/Longitude',
  };

  // Calculate order totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const tax = subtotal * 0.1;
  const deliveryFee = 2.99;
  const total = subtotal + tax + deliveryFee;

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems, navigate]);

  const handlePlaceOrder = async () => {
    
    if (!paymentMethod) {
      toast.error('Please select a payment method.');
      return;
    }

    setIsProcessing(true);

    const apiURL = import.meta.env.VITE_API_URL;

    try {
      // Here you would typically send the order to your backend
      const orderData = {
        items: cartItems,
        totalAmount: total.toFixed(2),
        paymentMethod,
        deliveryAddress: deliveryLocation,
      };

      await axios.post(`${apiURL}/api/orders/create`, orderData, {
        withCredentials: true,
      });

      
      // Navigate to success page or home
      toast.success('Order placed successfully!');
      navigate('/my-orders');
    } catch (error) {
      console.error('Order failed:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      // Clear cart after successful order
      dispatch(userSliceActions.clearCart());
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      mode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-2000 shadow-md transition-colors duration-300 ${
        mode === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center bg-transparent gap-2 transition-colors duration-300 ${
              mode === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-lg font-medium">Back</span>
          </button>
          <h1 className={`text-2xl font-bold transition-colors duration-300 ${
            mode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Checkout
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Delivery & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Location Card */}
            <div className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${
              mode === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className={`text-xl font-bold transition-colors duration-300 ${
                  mode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Delivery Location
                </h2>
              </div>

              <div className={`mb-4 p-3 rounded-lg transition-colors duration-300 ${
                mode === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'
              }`}>
                <p className="text-sm font-medium mb-1">Delivering to:</p>
                <p className="font-semibold">{deliveryLocation.address}</p>
              </div>

              {/* Map */}
              <div className={`rounded-lg overflow-hidden border-2 transition-colors duration-300 ${
                mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <MapContainer
                  center={[deliveryLocation.lat, deliveryLocation.lon]}
                  zoom={15}
                  style={{ height: '300px', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[deliveryLocation.lat, deliveryLocation.lon]} />
                </MapContainer>
              </div>

              {/* Delivery Instructions */}
              <div className="mt-4">
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="E.g., Ring the bell, Leave at door, etc."
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors duration-300 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                    mode === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Payment Method Card */}
            <div className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${
              mode === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className={`text-xl font-bold transition-colors duration-300 ${
                  mode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery Option */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'COD'
                      ? 'border-green-500 bg-green-50/10'
                      : mode === 'dark'
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-green-500 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className={`font-semibold transition-colors duration-300 ${
                        mode === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Cash on Delivery
                      </span>
                    </div>
                    <p className={`text-sm mt-1 transition-colors duration-300 ${
                      mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Pay with cash when your order arrives
                    </p>
                  </div>
                </label>

                {/* Online Payment Option */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'Online'
                      ? 'border-green-500 bg-green-50/10'
                      : mode === 'dark'
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online"
                    checked={paymentMethod === 'Online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-green-500 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className={`font-semibold transition-colors duration-300 ${
                        mode === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Online Payment
                      </span>
                    </div>
                    <p className={`text-sm mt-1 transition-colors duration-300 ${
                      mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Secure payment via UPI, Cards, or Net Banking
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
                      <rect width="48" height="48" rx="8" fill="#5F6368"/>
                      <text x="24" y="28" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">UPI</text>
                    </svg>
                  </div>
                </label>
              </div>

              {/* Security Badge */}
              <div className={`mt-4 flex items-center gap-2 p-3 rounded-lg transition-colors duration-300 ${
                mode === 'dark' ? 'bg-gray-700' : 'bg-green-50'
              }`}>
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span className={`text-sm transition-colors duration-300 ${
                  mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Your payment information is secure and encrypted
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl shadow-lg p-6 sticky top-24 transition-colors duration-300 ${
              mode === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                mode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 p-3 rounded-lg transition-colors duration-300 ${
                      mode === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                      {item?.image && (String(item.image).startsWith('http') || String(item.image).startsWith('/')) ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🍽️
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm truncate transition-colors duration-300 ${
                        mode === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </h3>
                      <p className={`text-xs transition-colors duration-300 ${
                        mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Qty: {item.quantity || 1}
                      </p>
                      <p className="text-green-500 font-semibold text-sm">
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className={`border-t border-b py-4 space-y-3 transition-colors duration-300 ${
                mode === 'dark' ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className={`flex justify-between items-center mt-4 mb-6 transition-colors duration-300 ${
                mode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-green-500">${total.toFixed(2)}</span>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                } text-white`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Place Order
                  </span>
                )}
              </button>

              {/* Trust Indicators */}
              <div className={`mt-4 pt-4 border-t space-y-2 transition-colors duration-300 ${
                mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-2 text-xs">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  <span className={`transition-colors duration-300 ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    100% secure checkout
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  <span className={`transition-colors duration-300 ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Easy cancellation & refund
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
