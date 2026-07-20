import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {

    getAuth,

    signInWithEmailAndPassword,

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const firebaseConfig = {

    apiKey:"AIzaSyB3PPdJo8H-tDcWcDxzjs4aGUviYru_cFI",

    authDomain:"codigobarber-77c02.firebaseapp.com",

    projectId:"codigobarber-77c02",

    storageBucket:"codigobarber-77c02.firebasestorage.app",

    messagingSenderId:"195673258655",

    appId:"1:195673258655:web:dfeee4cca2b6b7e03780aa"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const email = document.getElementById("email");

const password = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");

const error = document.getElementById("error");

loginBtn.addEventListener("click", async()=>{

    try{

        await signInWithEmailAndPassword(

            auth,

            email.value,

            password.value

        );

        location.href="admin.html";

    }catch(e){

        error.textContent="Correo o contraseña incorrectos.";

    }

});

onAuthStateChanged(auth,(user)=>{

    if(user){

        location.href="admin.html";

    }

});