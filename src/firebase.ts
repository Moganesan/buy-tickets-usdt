// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNxS_oup_kjeDySVDgRXv4FZjwxUbWLTs",
  authDomain: "swap-tx.firebaseapp.com",
  projectId: "swap-tx",
  storageBucket: "swap-tx.appspot.com",
  messagingSenderId: "355815659650",
  appId: "1:355815659650:web:0397ffcfa97f55fc86bc9b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
