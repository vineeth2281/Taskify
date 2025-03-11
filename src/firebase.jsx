// Import the functions you need from the SDKs you need
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBuqbcPJMqylsqNVQb9BTqOuUf2WWSxad0",
  authDomain: "taskify-2c1f4.firebaseapp.com",
  projectId: "taskify-2c1f4",
  storageBucket: "taskify-2c1f4.firebasestorage.app",
  messagingSenderId: "911110328233",
  appId: "1:911110328233:web:6d59a68db8521c2c56feb8",
  measurementId: "G-HT3M57TLW8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export {auth,provider};