document.addEventListener("DOMContentLoaded", () => {
  const momentsTrack = document.getElementById("momentsTrack");
  const prevBtn = document.getElementById("prevMoment");
  const nextBtn = document.getElementById("nextMoment");
  const themeBtn = document.getElementById("themeButton");

  if (!momentsTrack || !prevBtn || !nextBtn) {
    return;
  }

  // переключатель темы
  function initThemeToggle() {
    if (!themeBtn) return;

    themeBtn.onclick = function () {
      document.body.classList.toggle("light");

      if (document.body.classList.contains("light")) {
        themeBtn.textContent = "☾";
      } else {
        themeBtn.textContent = "☀";
      }
    };
  }

  // клонируем слайды для бесконечной карусели
  function cloneSlides() {
    const originalSlides = momentsTrack.querySelectorAll(".moments__slide");
    const count = originalSlides.length;

    if (count === 0) return 0;

    for (let i = 0; i < count; i++) {
      const cloneAfter = originalSlides[i].cloneNode(true);
      cloneAfter.dataset.clone = "after";
      momentsTrack.appendChild(cloneAfter);
    }

    for (let i = 0; i < count; i++) {
      const cloneBefore = originalSlides[i].cloneNode(true);
      cloneBefore.dataset.clone = "before";
      momentsTrack.insertBefore(cloneBefore, momentsTrack.firstChild);
    }

    return count;
  }

  const originalCount = cloneSlides();
  if (originalCount === 0) return;

  const allSlides = momentsTrack.querySelectorAll(".moments__slide");
  let currentIndex = originalCount;

  // ширина одного слайда с учётом gap
  function getSlideWidth() {
    const firstSlide = allSlides[0];
    if (!firstSlide) return 0;

    const styles = window.getComputedStyle(momentsTrack);
    const gap = parseFloat(styles.gap) || 0;

    return firstSlide.getBoundingClientRect().width + gap;
  }

  // двигаем трек
  function moveTrack(animated) {
    const slideWidth = getSlideWidth();
    if (!slideWidth) return;

    if (animated) {
      momentsTrack.style.transition = "transform .55s cubic-bezier(.22,.61,.36,1)";
    } else {
      momentsTrack.style.transition = "none";
    }

    momentsTrack.style.transform =
      "translate3d(-" + currentIndex * slideWidth + "px, 0, 0)";
  }

  function goNext() {
    currentIndex = currentIndex + 1;
    moveTrack(true);
  }

  function goPrev() {
    currentIndex = currentIndex - 1;
    moveTrack(true);
  }

  // кнопки
  function initButtons() {
    nextBtn.onclick = function () {
      goNext();
    };

    prevBtn.onclick = function () {
      goPrev();
    };
  }

  // бесконечный цикл после анимации
  function initLoop() {
    momentsTrack.addEventListener("transitionend", function () {
      if (currentIndex >= originalCount * 2) {
        currentIndex = currentIndex - originalCount;
        moveTrack(false);
      }

      if (currentIndex < originalCount) {
        currentIndex = currentIndex + originalCount;
        moveTrack(false);
      }
    });
  }

  // свайп
  function initTouch() {
    let startX = 0;
    let startY = 0;

    momentsTrack.addEventListener(
      "touchstart",
      function (e) {
        startX = e.changedTouches[0].screenX;
        startY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    momentsTrack.addEventListener(
      "touchend",
      function (e) {
        const endX = e.changedTouches[0].screenX;
        const endY = e.changedTouches[0].screenY;
        const diffX = startX - endX;
        const diffY = startY - endY;

        if (Math.abs(diffY) > Math.abs(diffX)) return;
        if (Math.abs(diffX) < 40) return;

        if (diffX > 0) {
          goNext();
        } else {
          goPrev();
        }
      },
      { passive: true }
    );
  }

  // мышь
  function initMouseDrag() {
    let mouseStartX = 0;
    let isDown = false;

    momentsTrack.addEventListener("mousedown", function (e) {
      isDown = true;
      mouseStartX = e.clientX;
      momentsTrack.style.cursor = "grabbing";
    });

    momentsTrack.addEventListener("mouseup", function (e) {
      if (!isDown) return;

      isDown = false;
      momentsTrack.style.cursor = "default";

      const diff = mouseStartX - e.clientX;
      if (Math.abs(diff) < 50) return;

      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
    });

    momentsTrack.addEventListener("mouseleave", function () {
      isDown = false;
      momentsTrack.style.cursor = "default";
    });
  }

  // колёсико
  function initWheel() {
    momentsTrack.addEventListener(
      "wheel",
      function (e) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

        e.preventDefault();

        if (e.deltaY > 0) {
          goNext();
        } else {
          goPrev();
        }
      },
      { passive: false }
    );
  }

  // ресайз
  function initResize() {
    window.addEventListener("resize", function () {
      moveTrack(false);
    });
  }

  // старт
  function startCarousel() {
    requestAnimationFrame(function () {
      moveTrack(false);
    });
  }

  initThemeToggle();
  initButtons();
  initLoop();
  initTouch();
  initMouseDrag();
  initWheel();
  initResize();
  startCarousel();
});
