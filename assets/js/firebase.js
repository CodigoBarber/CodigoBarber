import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {

    getFirestore,

    collection,

    addDoc,

    getDocs,

    onSnapshot,

    query,

    where,

    orderBy,

    updateDoc,

    deleteDoc,

    doc

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {

    getAuth,

    onAuthStateChanged,

    signOut

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const firebaseConfig={

    apiKey:"AIzaSyB3PPdJo8H-tDcWcDxzjs4aGUviYru_cFI",

    authDomain:"codigobarber-77c02.firebaseapp.com",

    projectId:"codigobarber-77c02",

    storageBucket:"codigobarber-77c02.firebasestorage.app",

    messagingSenderId:"195673258655",

    appId:"1:195673258655:web:dfeee4cca2b6b7e03780aa"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export{

    auth,

    onAuthStateChanged,

    signOut,

    db,

    collection,

    addDoc,

    getDocs,

    onSnapshot,

    query,

    where,

    orderBy,

    updateDoc,

    deleteDoc,

    doc

};