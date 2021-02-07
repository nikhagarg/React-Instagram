import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCJ0l6R46BU5fKHR0uljvNAjxyYFuCCvcM",
    authDomain: "niks-insta-clone.firebaseapp.com",
    projectId: "niks-insta-clone",
    storageBucket: "niks-insta-clone.appspot.com",
    messagingSenderId: "890389067809",
    appId: "1:890389067809:web:a686dbce7d343e3e1d0b60",
    measurementId: "G-DFSYYR2NSM"
});

const db= firebaseApp.firestore();  // access to db
const auth = firebase.auth(); // access to authentification
const storage = firebase.storage(); // how to upload bunch of pics etc to firebase db.

export {db, auth, storage};