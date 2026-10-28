(() => {
  "use strict";
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const body = document.body;

  if (menuButton && nav) {
    const closeMenu = () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Buka menu navigasi");
      body.classList.remove("menu-open");
    };
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Tutup menu navigasi" : "Buka menu navigasi",
      );
      body.classList.toggle("menu-open", isOpen);
    });
    nav
      .querySelectorAll("a")
      .forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const topButton = document.querySelector(".back-to-top");
  const updateTopButton = () => {
    if (topButton) topButton.classList.toggle("visible", window.scrollY > 550);
  };
  window.addEventListener("scroll", updateTopButton, { passive: true });
  updateTopButton();
  if (topButton)
    topButton.addEventListener("click", () =>
      window.scrollTo({
        top: 0,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      }),
    );

  const revealTargets = document.querySelectorAll(
    ".service-card, .section-heading, .quality-points > div, .gallery-item, .about-copy, .about-mark, .location-layout, .review-placeholder, .faq-list details",
  );
  if (
    "IntersectionObserver" in window &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    revealTargets.forEach((el) => el.classList.add("reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealTargets.forEach((el) => observer.observe(el));
  }

  // Hero carousel: controls, touch swipe, and automatic progression.
  const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
  const heroDots = Array.from(document.querySelectorAll(".hero-dot"));
  const heroNumber = document.getElementById("hero-slide-number");
  if (heroSlides.length) {
    let activeSlide = 0;
    let autoSlide = null;
    const showSlide = (next) => {
      activeSlide = (next + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((slide, i) =>
        slide.classList.toggle("is-active", i === activeSlide),
      );
      heroDots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === activeSlide);
        dot.setAttribute("aria-pressed", String(i === activeSlide));
      });
      if (heroNumber)
        heroNumber.textContent = String(activeSlide + 1).padStart(2, "0");
    };
    document
      .querySelector(".hero-prev")
      ?.addEventListener("click", () => showSlide(activeSlide - 1));
    document
      .querySelector(".hero-next")
      ?.addEventListener("click", () => showSlide(activeSlide + 1));
    heroDots.forEach((dot) =>
      dot.addEventListener("click", () =>
        showSlide(Number(dot.dataset.goSlide)),
      ),
    );
    const hero = document.querySelector(".hero");
    let touchStartX = null;
    hero?.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true },
    );
    hero?.addEventListener(
      "touchend",
      (e) => {
        if (touchStartX === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 45) showSlide(activeSlide + (delta < 0 ? 1 : -1));
        touchStartX = null;
      },
      { passive: true },
    );
    const startAuto = () => {
      window.clearInterval(autoSlide);
      autoSlide = window.setInterval(() => showSlide(activeSlide + 1), 5000);
    };
    hero?.addEventListener("mouseenter", () => window.clearInterval(autoSlide));
    hero?.addEventListener("mouseleave", startAuto);
    startAuto();
  }

  const reviewList = document.getElementById("submitted-reviews-list");
  const submittedReviews = document.getElementById("submitted-reviews");
  const reviewStorageKey = "bhinekaMotorSubmittedReviews";
  const readReviews = () => {
    try {
      return JSON.parse(localStorage.getItem(reviewStorageKey) || "[]");
    } catch (_) {
      return [];
    }
  };
  const renderReviews = () => {
    if (!reviewList || !submittedReviews) return;
    const reviews = readReviews().filter(
      (review) => review.status === "approved",
    );
    reviewList.replaceChildren();
    submittedReviews.hidden = reviews.length === 0;
    reviews
      .slice()
      .reverse()
      .forEach((review) => {
        const card = document.createElement("article");
        card.className = "submitted-review-card";
        const top = document.createElement("div");
        top.className = "submitted-review-top";
        const name = document.createElement("span");
        name.className = "submitted-review-name";
        name.textContent = review.name;
        const stars = document.createElement("span");
        stars.className = "submitted-review-stars";
        stars.textContent =
          "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        stars.setAttribute("aria-label", `${review.rating} dari 5 bintang`);
        top.append(name, stars);
        const service = document.createElement("small");
        service.className = "submitted-review-service";
        service.textContent = `${review.service} · ${review.date}`;
        const message = document.createElement("p");
        message.className = "submitted-review-text";
        message.textContent = review.message;
        card.append(top, service, message);
        reviewList.append(card);
      });
  };
  renderReviews();
  window.addEventListener("bhineka-reviews-updated", renderReviews);
  window.addEventListener("storage", (event) => {
    if (!event.key || event.key === reviewStorageKey) renderReviews();
  });

  const reviewForm = document.getElementById("review-form");
  if (reviewForm) {
    reviewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!reviewForm.reportValidity()) return;
      const name = document.getElementById("review-name").value.trim();
      const rating = reviewForm.querySelector(
        'input[name="rating"]:checked',
      )?.value;
      const service = document.getElementById("review-service").value;
      const message = document.getElementById("review-message").value.trim();
      const consent = document.getElementById("review-consent").checked;
      const status = document.getElementById("review-form-status");
      if (!name || !rating || !service || message.length < 10 || !consent) {
        if (status)
          status.textContent =
            "Mohon lengkapi semua kolom dan persetujuan sebelum mengirim.";
        return;
      }
      const submitted = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        rating: Number(rating),
        service,
        message,
        date: new Date().toLocaleDateString("id-ID"),
        status: "pending",
      };
      try {
        const reviews = readReviews();
        reviews.push(submitted);
        localStorage.setItem(
          reviewStorageKey,
          JSON.stringify(reviews.slice(-30)),
        );
        renderReviews();
        window.dispatchEvent(new CustomEvent("bhineka-reviews-updated"));
        if (status)
          status.textContent =
            "Terima kasih! Ulasan Anda sudah dikirim dan menunggu persetujuan admin sebelum ditampilkan.";
        reviewForm.reset();
      } catch (_) {
        if (status)
          status.textContent =
            "Browser tidak mengizinkan penyimpanan lokal. Ulasan belum dapat disimpan; coba aktifkan penyimpanan situs di pengaturan browser.";
      }
    });
  }

  const dialog = document.querySelector(".gallery-dialog");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogDescription = document.getElementById("dialog-description");
  const dialogImage = document.getElementById("dialog-image");
  const dialogSymbol = document.getElementById("dialog-symbol");
  const galleryNames = [
    "Foto BHINEKA MOTOR 1",
    "Foto BHINEKA MOTOR 2",
    "Foto BHINEKA MOTOR 3",
    "Foto BHINEKA MOTOR 4",
    "Foto BHINEKA MOTOR 5",
  ];
  document.querySelectorAll("[data-gallery]").forEach((item) => {
    item.addEventListener("click", () => {
      const index = Number(item.dataset.gallery);
      if (!dialog) return;
      dialogTitle.textContent = galleryNames[index] || "Galeri BHINEKA MOTOR";
      const image = item.querySelector(".gallery-placeholder img");
      if (image && dialogImage) {
        dialogImage.src = image.currentSrc || image.src;
        dialogImage.alt =
          image.alt || galleryNames[index] || "Foto BHINEKA MOTOR";
        dialogImage.hidden = false;
        if (dialogSymbol) dialogSymbol.hidden = true;
        dialogDescription.textContent = "Foto galeri BHINEKA MOTOR.";
      } else {
        if (dialogImage) {
          dialogImage.hidden = true;
          dialogImage.removeAttribute("src");
        }
        if (dialogSymbol) dialogSymbol.hidden = false;
        dialogDescription.textContent =
          "Ini adalah slot galeri, bukan foto bisnis asli. Ganti dengan foto BHINEKA MOTOR sendiri sesuai panduan README.";
      }
      if (typeof dialog.showModal === "function") dialog.showModal();
    });
  });
  const closeDialog = document.querySelector(".dialog-close");
  if (closeDialog && dialog)
    closeDialog.addEventListener("click", () => dialog.close());
  if (dialog)
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
})();
