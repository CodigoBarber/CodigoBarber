import {

    db,

    collection,

    addDoc,

    getDocs,

    query,

    where

} from "./firebase.js";

/*=========================================
        CONFIGURACION
=========================================*/

const HOME_PRICE = 10000;

const SERVICES = {

    adulto:{
        name:"Corte Adulto",
        price:25000,
        minutes:60
    },
 
    nino:{
        name:"Corte Niño",
        price:20000,
        minutes:60
    },

    barba:{
        name:"Perfilado de Barba",
        price:15000,
        minutes:30
    },

    combo:{
        name:"Corte + Barba",
        price:35000,
        minutes:90
    }

};

/*=========================================
        CALCULAR HORAS DE LA RESERVA
=========================================*/

function calculateBlockedHours(){

    let totalMinutes=0;

    reservation.servicios.forEach(service=>{

        totalMinutes+=SERVICES[service].minutes;

    });

    return Math.ceil(totalMinutes/60);

}

let reservation={

    nombre:"",
    telefono:"",
    direccion:"",
    fecha:"",
    hora:"",
    servicios:[]

};
/*=========================================
        FECHA MINIMA
=========================================*/

const fecha=document.getElementById("fecha");

if(fecha){

    const hoy=new Date();

    const yyyy=hoy.getFullYear();

    const mm=String(hoy.getMonth()+1).padStart(2,"0");

    const dd=String(hoy.getDate()).padStart(2,"0");

    fecha.min=`${yyyy}-${mm}-${dd}`;

    fecha.value=`${yyyy}-${mm}-${dd}`;

}

/*=========================================
        CAMBIO DE FECHA
=========================================*/

fecha.addEventListener("change", async ()=>{

    reservation.fecha = fecha.value;

    // Obtener el día de la semana
    const selectedDate = new Date(fecha.value + "T00:00:00");

    // Domingo = 0
    if(selectedDate.getDay() === 0){

        alert("🚫 Los domingos no prestamos servicio.");

        fecha.value = "";
        reservation.fecha = "";

        document.querySelectorAll(".hour").forEach(button=>{

            if(!button.classList.contains("lunch")){

                button.disabled = true;

            }

        });

        return;

    }

    await loadOccupiedHours();

});

/*=========================================
        PASOS
=========================================*/

const pages=document.querySelectorAll(".step-page");

let currentStep=0;

function showStep(index){

    pages.forEach(page=>page.classList.remove("active"));

    pages[index].classList.add("active");

    updateProgress();

    if(index===2){

        loadOccupiedHours();

    }

}

function updateProgress(){

    const steps=document.querySelectorAll(".progress .step");
    const lines=document.querySelectorAll(".progress .line");

    steps.forEach((step,index)=>{

        if(index<=currentStep){

            step.classList.add("active");

        }else{

            step.classList.remove("active");

        }

    });

    lines.forEach((line,index)=>{

        if(index<currentStep){

            line.classList.add("active");

        }else{

            line.classList.remove("active");

        }

    });

}

document.querySelectorAll(".next").forEach(btn=>{

    btn.onclick=()=>{

        if(currentStep<pages.length-1){

            currentStep++;

            showStep(currentStep);

        }

    };

});

document.querySelectorAll(".backStep").forEach(btn=>{

    btn.onclick=()=>{

        if(currentStep>0){

            currentStep--;

            showStep(currentStep);

        }

    };

});
/*=========================================
        DATOS CLIENTE
=========================================*/

document.querySelector("#paso1 .next").onclick=()=>{


reservation.nombre=document.getElementById("nombre").value.trim();

reservation.telefono=document.getElementById("telefono").value.trim();

reservation.direccion=document.getElementById("direccion").value.trim();

if(

reservation.nombre===""||

reservation.telefono===""||

reservation.direccion===""

){

alert("Completa todos los campos.");

return;

}

currentStep=1;

showStep(currentStep);

};

/*=========================================
        AGREGAR SERVICIO
=========================================*/

const addService=document.getElementById("addService");

let serviceNumber=1;

addService.onclick=()=>{

    serviceNumber++;

    const first=document.querySelector(".service-box");

    const clone=first.cloneNode(true);

    clone.querySelector("h3").textContent=`Cliente ${serviceNumber}`;

    clone.querySelectorAll(".service-option").forEach(card=>{

        card.classList.remove("selected");

    });

    servicesContainer.appendChild(clone);

};
/*=========================================
        SELECCIONAR SERVICIOS
=========================================*/

const servicesContainer=document.getElementById("servicesContainer");

servicesContainer.addEventListener("click",(e)=>{

    const option=e.target.closest(".service-option");

    if(!option) return;

    const box=option.closest(".service-box");

    box.querySelectorAll(".service-option").forEach(card=>{

        card.classList.remove("selected");

    });

    option.classList.add("selected");

    updateReservation();

});
/*=========================================
        RESUMEN
=========================================*/

function updateReservation(){

    reservation.servicios=[];

    let total=HOME_PRICE;

    document.querySelectorAll(".service-box").forEach(box=>{

        const selected=box.querySelector(".selected");

        if(!selected) return;

        const key=selected.dataset.service;

        reservation.servicios.push(key);

        total+=SERVICES[key].price;

    });

    drawSummary(total);

}
/*=========================================
        DIBUJAR RESUMEN
=========================================*/

function drawSummary(total){

    const container=document.getElementById("summaryServices");

    container.innerHTML="";

    reservation.servicios.forEach(service=>{

        container.innerHTML+=`

        <div class="summary-line">

            <span>${SERVICES[service].name}</span>

            <strong>$${SERVICES[service].price.toLocaleString("es-CO")}</strong>

        </div>

        `;

    });

    document.getElementById("totalPrice").textContent=

    "$"+total.toLocaleString("es-CO");

}
/*=========================================
        VALIDAR SERVICIOS
=========================================*/

document.querySelector("#paso2 .next").onclick=()=>{

    const boxes=document.querySelectorAll(".service-box");

    let valid=true;

    boxes.forEach((box,index)=>{

        const selected=box.querySelector(".selected");

        if(!selected){

            alert(`Debes seleccionar un servicio para el Cliente ${index+1}.`);

            valid=false;

            return;

        }

    });

    if(!valid) return;

    updateReservation();

    currentStep=2;

    showStep(currentStep);

};
/*=========================================
        HORARIOS
=========================================*/

const hours=document.querySelectorAll(".hour");

hours.forEach(btn=>{

    if(btn.disabled) return;

    btn.onclick=()=>{

        hours.forEach(h=>{

            if(!h.disabled){

                h.classList.remove("selected");

            }

        });

        btn.classList.add("selected");

        reservation.hora=btn.dataset.hour;

    };

});
/*=========================================
        VALIDAR FECHA
=========================================*/

document.querySelector("#paso3 .next").onclick=async ()=>{

    reservation.fecha=fecha.value;

if(reservation.fecha===""){

    alert("Selecciona una fecha.");

    return;

}

if(reservation.hora===""){

    alert("Selecciona una hora.");

    return;

}

updateReservation();

currentStep=3;

showStep(currentStep);

};
/*=========================================
        CONFIRMAR
=========================================*/

document.getElementById("confirmReservation").onclick = async ()=>{

    try{

        const reservationData = buildReservationData();

        await addDoc(

            collection(db,"reservas"),

            reservationData

        );

        await loadOccupiedHours();
        alert("✅ Reserva guardada correctamente.");

// Volver al inicio
window.location.href = "index.html";

        console.log(reservationData);

    }catch(error){

    console.error("ERROR FIREBASE:", error);

    alert(error.message);

}

};
/*=========================================
        HORARIOS DEL DÍA
=========================================*/

const AVAILABLE_HOURS=[

    "08:00",
    "09:00",
    "10:00",
    "11:00",

    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00"

];
/*=========================================
        CALCULAR HORARIOS A BLOQUEAR
=========================================*/

function calculateReservedHours(){

    const startIndex=AVAILABLE_HOURS.indexOf(reservation.hora);

    const blockedHours=calculateBlockedHours();

    return AVAILABLE_HOURS.slice(

        startIndex,

        startIndex+blockedHours

    );

}

/*=========================================
        TOTAL DE LA RESERVA
=========================================*/

function calculateTotal(){

    let total=HOME_PRICE;

    reservation.servicios.forEach(service=>{

        total+=SERVICES[service].price;

    });

    return total;

}

/*=========================================
        CREAR OBJETO RESERVA
=========================================*/

function buildReservationData(){

    return{

    nombre:reservation.nombre,

    telefono:reservation.telefono,

    direccion:reservation.direccion,

    fecha:reservation.fecha,

    horaInicio:reservation.hora,

    horasBloqueadas:calculateReservedHours(),

    servicios:[...reservation.servicios],

    total:calculateTotal(),

    estado:"pendiente",

    createdAt:new Date().toISOString()

};

}

/*=========================================
        HORARIOS OCUPADOS (TEMPORAL)
=========================================*/

let occupiedHours = [];

/*=========================================
    ACTUALIZAR HORARIOS
=========================================*/

function refreshHours(){

    const today = new Date();

    const todayString = today.toISOString().split("T")[0];

    document.querySelectorAll(".hour").forEach(button=>{

        if(button.classList.contains("lunch")) return;

        const hour = button.dataset.hour;

        let disabled = false;

        // Horas ocupadas
        if(occupiedHours.includes(hour)){

            disabled = true;

        }

        // Si la fecha seleccionada es HOY
        if(fecha.value === todayString){

            let [h,m] = hour.split(":").map(Number);

            const hourDate = new Date();

            hourDate.setHours(h,m,0,0);

            if(hourDate <= today){

                disabled = true;

            }

        }

        button.disabled = disabled;

        if(disabled){

            button.classList.remove("selected");

        }

    });

}
/*=========================================
        CARGAR HORARIOS OCUPADOS
=========================================*/

async function loadOccupiedHours(){

    if(!fecha.value) return;

    occupiedHours = [];

    const q = query(

        collection(db, "reservas"),

        where("fecha", "==", fecha.value)

    );

    const snapshot = await getDocs(q);

   snapshot.forEach(doc => {

    const data = doc.data();

    if(

        (data.estado === "pendiente" || data.estado === "confirmada")

        &&

        data.horasBloqueadas

    ){

        occupiedHours.push(...data.horasBloqueadas);

    }

});

    console.log("Horas ocupadas:", occupiedHours);
occupiedHours = [...new Set(occupiedHours)];
    refreshHours();

}

