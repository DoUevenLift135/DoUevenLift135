// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZVTVM3W7ulUmH8412A6lgtb_TReTTlAw",
  authDomain: "douevenlift135.firebaseapp.com",
  projectId: "douevenlift135",
  storageBucket: "douevenlift135.firebasestorage.app",
  messagingSenderId: "613232536621",
  appId: "1:613232536621:web:ad919a28ac526990149ca4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);