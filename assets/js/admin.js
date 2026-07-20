import {

    auth,

    onAuthStateChanged,

    signOut,

    db,

    collection,

    getDocs,

    onSnapshot,

    query,

    orderBy,

    updateDoc,

    deleteDoc,

    doc

} from "./firebase.js";

/*=========================================
            ELEMENTOS
=========================================*/

const reservationsList = document.getElementById("reservationsList");

const pendingCount = document.getElementById("pendingCount");
const confirmedCount = document.getElementById("confirmedCount");
const cancelledCount = document.getElementById("cancelledCount");

const logoutBtn = document.getElementById("logoutBtn");

const totalMoney = document.getElementById("totalMoney");

const confirmedHeader = document.getElementById("confirmedHeader");
const cancelledHeader = document.getElementById("cancelledHeader");

const clearCancelledBtn = document.getElementById("clearCancelled");
const clearConfirmedBtn = document.getElementById("clearConfirmed");

/*=========================================
            VARIABLES
=========================================*/

let currentSection = "pending";
let searchText = "";

let reservationsSnapshot = null;

/* Control de notificaciones */
let firstLoad = true;
const notificationSound = new Audio("assets/audio/notification.mp3");
let lastReservationId = null;

/*=========================================
            INICIAR
=========================================*/

document.addEventListener("DOMContentLoaded",()=>{

    onAuthStateChanged(auth,(user)=>{

        if(!user){

            location.href="login.html";

            return;

        }

        updateDate();

        initMenu();

        loadReservations();

    });

});

/*=========================================
        FECHA ACTUAL
=========================================*/
console.log("ADMIN NUEVO CARGADO");

function updateDate(){

    const currentDate = document.getElementById("currentDate");

    if(!currentDate) return;

    const today = new Date();

    currentDate.textContent = today.toLocaleDateString("es-CO",{

        weekday:"long",

        day:"numeric",

        month:"long",

        year:"numeric"

    });

}

function formatHour(hour){

    let [h,m] = hour.split(":");

    h = Number(h);

    const period = h >= 12 ? "PM" : "AM";

    h = h % 12 || 12;

    return `${h}:${m} ${period}`;

}

/*=========================================
            PANEL
=========================================*/

function initPanel(){

    initMenu();

    loadReservations();

}
/*=========================================
        CERRAR SESIÓN
=========================================*/

if(logoutBtn){

    logoutBtn.addEventListener("click",async()=>{

        await signOut(auth);

        location.href="login.html";

    });

}
/*=========================================
            MENÚ
=========================================*/

function initMenu(){

    document.querySelectorAll(".menu-btn").forEach(button=>{

        button.addEventListener("click",()=>{

            document.querySelectorAll(".menu-btn").forEach(btn=>{

                btn.classList.remove("active");

            });

            button.classList.add("active");

            currentSection = button.dataset.section;

            if(reservationsSnapshot){

                renderReservations(reservationsSnapshot);

                updateHeaders();

            }

        });

    });

}

/*=========================================
            WHATSAPP
=========================================*/

function createWhatsappMessage(data){

    return encodeURIComponent(

`Hola ${data.nombre},

Tu reserva en CódigoBarber ha sido confirmada.

📅 Fecha: ${data.fecha}

🕗 Hora: ${formatHour(data.horaInicio)}

Nuestro barbero llegará a la dirección registrada en el horario acordado.

Si necesitas modificar tu cita puedes responder a este mensaje.

Gracias por confiar en CódigoBarber.`

    );

}
/*=========================================
        CARGAR RESERVAS
=========================================*/

let unsubscribeReservations = null;

function loadReservations(){

    if(unsubscribeReservations){

        unsubscribeReservations();

    }

    const q = query(

        collection(db,"reservas"),

        orderBy("createdAt","desc")

    );

    unsubscribeReservations = onSnapshot(q,(snapshot)=>{
reservationsSnapshot = snapshot;
        reservationsList.innerHTML = "";

        let pending = 0;
        let confirmed = 0;
        let cancelled = 0;
        let money = 0;

        snapshot.forEach(reserva=>{

    const data = reserva.data();

    switch(data.estado){

        case "pendiente":
            pending++;
            break;

        case "confirmada":
            confirmed++;
            money += Number(data.total);
            break;

        case "cancelada":
            cancelled++;
            break;

    }

});

/*=========================
    NUEVA RESERVA
=========================*/

if(!snapshot.empty){

    const firstDoc = snapshot.docs[0];

    if(firstLoad){

        lastReservationId = firstDoc.id;

        firstLoad = false;

    }else{

        if(firstDoc.id !== lastReservationId){

            lastReservationId = firstDoc.id;

            showToast(firstDoc.data());

        }

    }

}


        updateCounters(

            pending,

            confirmed,

            cancelled,

            money

        );

        updateHeaders();

        renderReservations(snapshot);
const firstCard = document.querySelector(".reservation-card");

if(firstCard && !firstLoad){

    firstCard.classList.add("new-reservation");

    setTimeout(()=>{

        firstCard.classList.remove("new-reservation");

    },2500);

}
    });

}

/*=========================================
        CONTADORES
=========================================*/

function updateCounters(

    pending,

    confirmed,

    cancelled,

    money

){

    pendingCount.textContent = pending;

    confirmedCount.textContent = confirmed;

    cancelledCount.textContent = cancelled;

    totalMoney.textContent =

        "$" + money.toLocaleString("es-CO");

}

/*=========================================
        ENCABEZADOS
=========================================*/

function updateHeaders(){

    if(confirmedHeader){

        confirmedHeader.style.display =

            currentSection==="confirmed"

            ?

            "block"

            :

            "none";

    }

    if(cancelledHeader){

        cancelledHeader.style.display =

            currentSection==="cancelled"

            ?

            "block"

            :

            "none";

    }

}
/*=========================================
        DIBUJAR RESERVAS
=========================================*/

function renderReservations(snapshot){

    reservationsList.innerHTML = "";

    snapshot.forEach(docSnap=>{

        const data = docSnap.data();

        /*=========================
            FILTRAR POR ESTADO
        =========================*/

        if(currentSection==="pending" && data.estado!=="pendiente") return;

        if(currentSection==="confirmed" && data.estado!=="confirmada") return;

        if(currentSection==="cancelled" && data.estado!=="cancelada") return;

        /*=========================
            BUSCADOR
        =========================*/

        if(searchText){

            const textoBusqueda = (

                (data.nombre || "") + " " +
                (data.telefono || "") + " " +
                (data.direccion || "") + " " +
                (data.fecha || "")

            ).toLowerCase();

            if(!textoBusqueda.includes(searchText)){

                return;

            }

        }

        reservationsList.innerHTML += createReservationCard(

            docSnap.id,

            data

        );

    });

}

/*=========================================
        TARJETA
=========================================*/

function createReservationCard(id,data){

    let buttons="";

    /*=========================
            PENDIENTES
    =========================*/

    if(currentSection==="pending"){

        buttons=`

            <button
                class="confirm-btn"
                data-id="${id}"
                data-phone="${data.telefono}"
                data-name="${data.nombre}"
                data-date="${data.fecha}"
                data-hour="${data.horaInicio}">

                ✔ Confirmar

            </button>

            <button
                class="cancel-btn"
                data-id="${id}">

                ✖ Cancelar

            </button>

        `;

    }

    /*=========================
            CONFIRMADAS
    =========================*/

    if(currentSection==="confirmed"){

        buttons=`

            <span class="status-confirmed">

                ✔ Confirmada

            </span>

        `;

    }

    /*=========================
            CANCELADAS
    =========================*/

    if(currentSection==="cancelled"){

        buttons=`

            <span class="status-cancelled">

                ✖ Cancelada

            </span>

        `;

    }

    return `

<div class="reservation-card">

    <div class="card-header">

        <h2>${formatHour(data.horaInicio)}</h2>

        <span class="badge badge-${data.estado}">

    ${
        data.estado==="pendiente"
        ? "Pendiente"
        :
        data.estado==="confirmada"
        ? "Confirmada"
        :
        "Cancelada"
    }

</span>

    </div>

    <div class="card-info">

    <div class="info-item">

        <i class="ri-user-3-line"></i>

        <span>${data.nombre}</span>

    </div>

    <div class="info-item">

        <i class="ri-map-pin-line"></i>

        <span>${data.direccion}</span>

    </div>

    <div class="info-item">

        <i class="ri-phone-line"></i>

        <span>${data.telefono}</span>

    </div>

    <div class="info-item">

        <i class="ri-scissors-line"></i>

        <span>${data.servicios.join(" • ")}</span>

    </div>

</div>

    <div class="price">

    <small>Total</small>

    <h1>

        $${Number(data.total).toLocaleString("es-CO")}

    </h1>

</div>

    <div class="actions">

        ${buttons}

    </div>

</div>

`;

}
/*=========================================
        EVENTOS
=========================================*/

document.addEventListener("click",async(e)=>{

    /*=========================
            CONFIRMAR
    =========================*/

    if(e.target.classList.contains("confirm-btn")){

        await confirmReservation(e.target);

        return;

    }

    /*=========================
            CANCELAR
    =========================*/

    if(e.target.classList.contains("cancel-btn")){

        await cancelReservation(e.target.dataset.id);

        return;

    }

});

/*=========================================
        CONFIRMAR RESERVA
=========================================*/

async function confirmReservation(button){

    const id = button.dataset.id;

    const telefono = button.dataset.phone;

    const nombre = button.dataset.name;

    const fecha = button.dataset.date;

    const horaInicio = button.dataset.hour;

    await updateDoc(

    doc(db,"reservas",id),

    {

        estado:"confirmada"

    }

);

    const mensaje = createWhatsappMessage({

        nombre,

        fecha,

        horaInicio

    });

    window.open(

        `https://wa.me/57${telefono}?text=${mensaje}`,

        "_blank"

    );

}

/*=========================================
        CANCELAR RESERVA
=========================================*/

async function cancelReservation(id){

    await updateDoc(

    doc(db,"reservas",id),

    {

        estado:"cancelada"

    }

);
}
/*=========================================
        LIMPIAR CANCELADAS
=========================================*/

if(clearCancelledBtn){

    clearCancelledBtn.addEventListener("click",async()=>{

        const ok = confirm(

            "¿Eliminar todas las reservas canceladas?"

        );

        if(!ok) return;

        const snapshot = await getDocs(

            collection(db,"reservas")

        );

        for(const reserva of snapshot.docs){

            const data = reserva.data();

            if(data.estado==="cancelada"){

                await deleteDoc(

                    doc(db,"reservas",reserva.id)

                );

            }

        }

       

    });

}

/*=========================================
        LIMPIAR HISTORIAL
=========================================*/

if(clearConfirmedBtn){

    clearConfirmedBtn.addEventListener("click",async()=>{

        const ok = confirm(

            "¿Eliminar todas las reservas confirmadas?"

        );

        if(!ok) return;

        const snapshot = await getDocs(

            collection(db,"reservas")

        );

        for(const reserva of snapshot.docs){

            const data = reserva.data();

            if(data.estado==="confirmada"){

                await deleteDoc(

                    doc(db,"reservas",reserva.id)

                );

            }

        }

    

    });

}

/*=========================================
        INICIAR
=========================================*/

/*=========================================
        BUSCADOR
=========================================*/

const searchInput = document.getElementById("searchReservation");

if(searchInput){

    searchInput.addEventListener("input",()=>{

        searchText = searchInput.value.toLowerCase().trim();

        loadReservations();

    });

}
/*=========================================
        TOAST
=========================================*/

function showToast(data){

    const toast = document.getElementById("toastNotification");

    const text = document.getElementById("toastText");

    text.innerHTML = `
        <strong>${data.nombre}</strong><br>
        ${formatHour(data.horaInicio)} • ${data.servicios.join(", ")}
    `;
notificationSound.currentTime = 0;
notificationSound.play();
    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },4000);

}

loadReservations();