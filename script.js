document.addEventListener("DOMContentLoaded", () => {
  /* ==================================================
       ПОЛУЧАЕМ ЭЛЕМЕНТЫ
    ================================================== */

  const track = document.getElementById("momentsTrack");

  const prevButton = document.getElementById("prevMoment");

  const nextButton = document.getElementById("nextMoment");

  /*
   * Если чего-то нет в HTML —
   * скрипт просто не запускается.
   */

  if (!track || !prevButton || !nextButton) {
    return;
  }

  /* ==================================================
       ОРИГИНАЛЬНЫЕ ФОТО
    ================================================== */

  const originalSlides = Array.from(track.querySelectorAll("img"));

  if (originalSlides.length === 0) {
    return;
  }

  const originalCount = originalSlides.length;

  /* ==================================================
       СОЗДАЁМ КОПИИ

       Было:

       1 2 3 4 5 6 7 8

       Станет:

       1 2 3 4 5 6 7 8
       1 2 3 4 5 6 7 8

       А слева добавляем ещё копию.
    ================================================== */

  const beforeSlides = originalSlides.map((image) => {
    const clone = image.cloneNode(true);

    clone.dataset.clone = "before";

    return clone;
  });

  const afterSlides = originalSlides.map((image) => {
    const clone = image.cloneNode(true);

    clone.dataset.clone = "after";

    return clone;
  });

  /* ==================================================
       ДОБАВЛЯЕМ КОПИИ СЛЕВА
    ================================================== */

  beforeSlides
    .slice()
    .reverse()
    .forEach((image) => {
      track.insertBefore(image, track.firstChild);
    });

  /* ==================================================
       ДОБАВЛЯЕМ КОПИИ СПРАВА
    ================================================== */

  afterSlides.forEach((image) => {
    track.appendChild(image);
  });

  /* ==================================================
       ВСЕ ФОТОГРАФИИ
    ================================================== */

  const slides = Array.from(track.querySelectorAll("img"));

  /* ==================================================
       ТЕКУЩАЯ ПОЗИЦИЯ

       Начинаем на первой оригинальной фотографии,
       а не на первой копии.
    ================================================== */

  let currentIndex = originalCount;

  /* ==================================================
       ПОЛУЧАЕМ ШИРИНУ ОДНОГО СЛАЙДА
    ================================================== */

  function getSlideWidth() {
    const slide = slides[0];

    if (!slide) {
      return 0;
    }

    const styles = window.getComputedStyle(track);

    const gap = parseFloat(styles.gap) || 0;

    return slide.getBoundingClientRect().width + gap;
  }

  /* ==================================================
       ПЕРЕМЕЩЕНИЕ
    ================================================== */

  function moveCarousel(animated = true) {
    const slideWidth = getSlideWidth();

    if (!slideWidth) {
      return;
    }

    if (animated) {
      track.style.transition = "transform .55s cubic-bezier(.22,.61,.36,1)";
    } else {
      track.style.transition = "none";
    }

    track.style.transform = `translate3d(
                -${currentIndex * slideWidth}px,
                0,
                0
            )`;
  }

  /* ==================================================
       СЛЕДУЮЩАЯ ФОТОГРАФИЯ
    ================================================== */

  function nextSlide() {
    currentIndex++;

    moveCarousel(true);
  }

  /* ==================================================
       ПРЕДЫДУЩАЯ ФОТОГРАФИЯ
    ================================================== */

  function previousSlide() {
    currentIndex--;

    moveCarousel(true);
  }

  /* ==================================================
       КНОПКА ВПЕРЁД
    ================================================== */

  nextButton.addEventListener("click", nextSlide);

  /* ==================================================
       КНОПКА НАЗАД
    ================================================== */

  prevButton.addEventListener("click", previousSlide);

  /* ==================================================
       БЕСКОНЕЧНОСТЬ

       Когда доходим до копии справа —
       незаметно возвращаемся в оригинальный блок.

       Пользователь этого не видит,
       потому что фотографии одинаковые.
    ================================================== */

  track.addEventListener("transitionend", () => {
    /*
     * Слишком далеко вправо
     */

    if (currentIndex >= originalCount * 2) {
      currentIndex -= originalCount;

      moveCarousel(false);
    }

    /*
     * Слишком далеко влево
     */

    if (currentIndex < originalCount) {
      currentIndex += originalCount;

      moveCarousel(false);
    }
  });

  /* ==================================================
       СВАЙП НА ТЕЛЕФОНЕ
    ================================================== */

  let touchStartX = 0;

  let touchStartY = 0;

  track.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].screenX;

      touchStartY = event.changedTouches[0].screenY;
    },
    {
      passive: true,
    },
  );

  track.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0].screenX;

      const touchEndY = event.changedTouches[0].screenY;

      const differenceX = touchStartX - touchEndX;

      const differenceY = touchStartY - touchEndY;

      /*
       * Если пользователь больше
       * двигался вверх/вниз —
       * это не свайп карусели.
       */

      if (Math.abs(differenceY) > Math.abs(differenceX)) {
        return;
      }

      /*
       * Слишком короткий свайп
       */

      if (Math.abs(differenceX) < 40) {
        return;
      }

      if (differenceX > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    },
    {
      passive: true,
    },
  );

  /* ==================================================
       ПЕРЕТАСКИВАНИЕ МЫШКОЙ
    ================================================== */

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

    const difference = mouseStartX - event.clientX;

    /*
     * Слишком короткое движение
     */

    if (Math.abs(difference) < 50) {
      return;
    }

    if (difference > 0) {
      nextSlide();
    } else {
      previousSlide();
    }
  });

  track.addEventListener("mouseleave", () => {
    mouseDown = false;

    track.style.cursor = "default";
  });

  /* ==================================================
       КОЛЕСО МЫШИ
    ================================================== */

  track.addEventListener(
    "wheel",
    (event) => {
      /*
       * Если пользователь
       * горизонтально скроллит —
       * не вмешиваемся.
       */

      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return;
      }

      event.preventDefault();

      if (event.deltaY > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    },
    {
      passive: false,
    },
  );

  /* ==================================================
       ПЕРЕСЧЁТ ПРИ ИЗМЕНЕНИИ ОКНА
    ================================================== */

  window.addEventListener("resize", () => {
    moveCarousel(false);
  });

  /* ==================================================
       ПЕРВОНАЧАЛЬНАЯ ПОЗИЦИЯ
    ================================================== */

  requestAnimationFrame(() => {
    moveCarousel(false);
  });
});
