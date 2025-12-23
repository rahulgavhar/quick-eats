// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "quickeats-96f65.firebaseapp.com",
  projectId: "quickeats-96f65",
  storageBucket: "quickeats-96f65.firebasestorage.app",
  messagingSenderId: "567287637176",
  appId: "1:567287637176:web:90a6531ce11326ca60004d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };