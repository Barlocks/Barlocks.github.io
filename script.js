document.addEventListener("DOMContentLoaded", () => {

    const track = document.getElementById("momentsTrack");
    const prevButton = document.getElementById("prevMoment");
    const nextButton = document.getElementById("nextMoment");

    if (!track || !prevButton || !nextButton) {
        return;
    }


    const slides = Array.from(track.querySelectorAll("img"));

    let currentIndex = 0;


    /* =========================================
       НАСТРОЙКИ
    ========================================= */

    function getGap() {

        const styles = window.getComputedStyle(track);

        return parseFloat(styles.gap) || 0;

    }


    function getSlideWidth() {

        if (!slides.length) {
            return 0;
        }

        return slides[0].getBoundingClientRect().width + getGap();

    }


    /* =========================================
       ДВИЖЕНИЕ КАРУСЕЛИ
    ========================================= */

    function updateCarousel() {

        const slideWidth = getSlideWidth();

        track.style.transform =
            `translateX(-${currentIndex * slideWidth}px)`;

    }


    /* =========================================
       СЛЕДУЮЩАЯ ФОТОГРАФИЯ
    ========================================= */

    nextButton.addEventListener("click", () => {

        currentIndex++;

        if (currentIndex >= slides.length) {
            currentIndex = 0;
        }

        updateCarousel();

    });


    /* =========================================
       ПРЕДЫДУЩАЯ ФОТОГРАФИЯ
    ========================================= */

    prevButton.addEventListener("click", () => {

        currentIndex--;

        if (currentIndex < 0) {
            currentIndex = slides.length - 1;
        }

        updateCarousel();

    });


    /* =========================================
       ПЕРЕСЧЁТ ПРИ ИЗМЕНЕНИИ РАЗМЕРА
    ========================================= */

    window.addEventListener("resize", () => {

        updateCarousel();

    });


    /* =========================================
       СВАЙП НА ТЕЛЕФОНЕ
    ========================================= */

    let touchStartX = 0;
    let touchEndX = 0;


    track.addEventListener(
        "touchstart",
        (event) => {

            touchStartX =
                event.changedTouches[0].screenX;

        },
        { passive: true }
    );


    track.addEventListener(
        "touchend",
        (event) => {

            touchEndX =
                event.changedTouches[0].screenX;

            const difference =
                touchStartX - touchEndX;


            /* Слишком маленькое движение
               не считаем свайпом */

            if (Math.abs(difference) < 40) {
                return;
            }


            if (difference > 0) {

                // Свайп влево
                nextButton.click();

            } else {

                // Свайп вправо
                prevButton.click();

            }

        },
        { passive: true }
    );


    /* =========================================
       ПЕРЕТАСКИВАНИЕ МЫШКОЙ НА ПК
    ========================================= */

    let mouseStartX = 0;
    let mouseDown = false;


    track.addEventListener("mousedown", (event) => {

        mouseDown = true;

        mouseStartX = event.clientX;

        track.style.cursor = "grabbing";

    });


    track.addEventListener("mouseup", (event) => {

        if (!mouseDown) {
            return;
        }

        mouseDown = false;

        track.style.cursor = "default";


        const difference =
            mouseStartX - event.clientX;


        if (Math.abs(difference) < 50) {
            return;
        }


        if (difference > 0) {

            nextButton.click();

        } else {

            prevButton.click();

        }

    });


    track.addEventListener("mouseleave", () => {

        mouseDown = false;

        track.style.cursor = "default";

    });


    /* =========================================
       КОЛЕСО МЫШИ
    ========================================= */

    track.addEventListener(
        "wheel",
        (event) => {

            /*
             * Работаем только если пользователь
             * крутит вертикальное колесо.
             */

            if (
                Math.abs(event.deltaY) <=
                Math.abs(event.deltaX)
            ) {
                return;
            }


            event.preventDefault();


            if (event.deltaY > 0) {

                nextButton.click();

            } else {

                prevButton.click();

            }

        },
        { passive: false }
    );


    /* =========================================
       ПЕРВОНАЧАЛЬНЫЙ ЗАПУСК
    ========================================= */

    updateCarousel();

});