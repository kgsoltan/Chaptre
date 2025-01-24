require('dotenv').config();
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FRONTEND_API_KEY,
  authDomain: "chaptre-b7fcb.firebaseapp.com",
  databaseURL: "https://chaptre-b7fcb-default-rtdb.firebaseio.com",
  projectId: "chaptre-b7fcb",
  storageBucket: "chaptre-b7fcb.firebasestorage.app",
  messagingSenderId: "552623882281",
  appId: "1:552623882281:web:e839cd84c5b6608f61dc38",
  measurementId: "G-KFYPKY3Y8K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);