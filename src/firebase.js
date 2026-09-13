import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFU211hleqPyEZn_rP_KP6ogXQ_rRK1dw",
  authDomain: "mca-notes-portal-ac47b.firebaseapp.com",
  projectId: "mca-notes-portal-ac47b",
  storageBucket: "mca-notes-portal-ac47b.firebasestorage.app",
  messagingSenderId: "863139611736",
  appId: "1:863139611736:web:cde77a19466abdc45af62d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);