/*=========================================
            LOADER
=========================================*/

window.addEventListener("load",()=>{

    const loader=document.getElementById("loader");

    if(loader){

        setTimeout(()=>{

            loader.style.opacity="0";

            loader.style.pointerEvents="none";

            setTimeout(()=>{

                loader.remove();

            },600);

        },1000);

    }

});

/*=========================================
        MENU RESPONSIVE
=========================================*/

const menu=document.querySelector(".menu-toggle");

const nav=document.querySelector("nav");

if(menu){

    menu.addEventListener("click",()=>{

        nav.classList.toggle("active");

    });

}

/*=========================================
        BOTON SUBIR
=========================================*/

const topButton=document.getElementById("top");

window.addEventListener("scroll",()=>{

    if(window.scrollY>500){

        topButton.style.display="flex";

    }else{

        topButton.style.display="none";

    }

});

if(topButton){

    topButton.onclick=()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    }

}
/*=========================================
        ANIMACIONES
=========================================*/

const observer=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},{
threshold:.15
});

document.querySelectorAll(

".service-card,.experience-card,.step,.gallery-grid img,.cta-content"

).forEach(el=>{

observer.observe(el);

});
