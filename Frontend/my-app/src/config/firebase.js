// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLdY5QtynVO93kMW_XGfWYFEDqHcjyk00",
  authDomain: "go-ad8e4.firebaseapp.com",
  projectId: "go-ad8e4",
  storageBucket: "go-ad8e4.firebasestorage.app",
  messagingSenderId: "963213787552",
  appId: "1:963213787552:web:a1b97fd343f58e8d9ee4c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app);
