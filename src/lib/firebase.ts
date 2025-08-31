import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "studyspark-snfha",
  "appId": "1:1070228110188:web:fc043710f33959e4415149",
  "storageBucket": "studyspark-snfha.firebasestorage.app",
  "apiKey": "AIzaSyBgrftpzv3gHt2nwvnqz77X4GM-_edIef8",
  "authDomain": "studyspark-snfha.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1070228110188"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
