(() => {
  "use strict";

  const supabaseClient = window.bhinekaSupabase;
  const $ = (id) => document.getElementById(id);

  // Navigasi mobile
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
      menuButton.setAttribute("aria-label", isOpen ? "Tutup menu navigasi" : "Buka menu navigasi");
      body.classList.toggle("menu-open", isOpen);
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  const year = $("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Tombol kembali ke atas
  const topButton = document.querySelector(".back-to-top");
  const updateTopButton = () => {
    if (topButton) topButton.classList.toggle("visible", window.scrollY > 550);
  };
  window.addEventListener("scroll", updateTopButton, { passive: true });
  updateTopButton();
  topButton?.addEventListener("click", () => window.scrollTo({
    top: 0,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  }));

  // Animasi saat elemen masuk layar
  const revealTargets = document.querySelectorAll(
    ".service-card, .section-heading, .quality-points > div, .gallery-item, .about-copy, .about-mark, .location-layout, .review-placeholder, .faq-list details"
  );
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealTargets.forEach((el) => el.classList.add("reveal"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((el) => observer.observe(el));
  }

  // Slider landing page, otomatis setiap 5 detik
  const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
  const heroDots = Array.from(document.querySelectorAll(".hero-dot"));
  const heroNumber = $("hero-slide-number");
  if (heroSlides.length) {
    let activeSlide = 0;
    let autoSlide;
    const showSlide = (next) => {
      activeSlide = (next + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === activeSlide));
      heroDots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === activeSlide);
        dot.setAttribute("aria-pressed", String(i === activeSlide));
      });
      if (heroNumber) heroNumber.textContent = String(activeSlide + 1).padStart(2, "0");
    };
    document.querySelector(".hero-prev")?.addEventListener("click", () => showSlide(activeSlide - 1));
    document.querySelector(".hero-next")?.addEventListener("click", () => showSlide(activeSlide + 1));
    heroDots.forEach((dot) => dot.addEventListener("click", () => showSlide(Number(dot.dataset.goSlide))));
    const hero = document.querySelector(".hero");
    let touchStartX = null;
    hero?.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    hero?.addEventListener("touchend", (e) => {
      if (touchStartX === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) showSlide(activeSlide + (delta < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });
    const startAuto = () => {
      window.clearInterval(autoSlide);
      autoSlide = window.setInterval(() => showSlide(activeSlide + 1), 5000);
    };
    hero?.addEventListener("mouseenter", () => window.clearInterval(autoSlide));
    hero?.addEventListener("mouseleave", startAuto);
    startAuto();
  }

  // Tampilkan ulasan yang sudah disetujui dari Supabase
  const reviewList = $("submitted-reviews-list");
  const submittedReviews = $("submitted-reviews");

  async function renderApprovedReviews() {
    if (!reviewList || !submittedReviews) return;
    if (!supabaseClient) {
      submittedReviews.hidden = true;
      console.error("Supabase belum dikonfigurasi: window.bhinekaSupabase tidak ditemukan.");
      return;
    }
    const { data, error } = await supabaseClient
      .from("reviews")
      .select("id,name,rating,service,message,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil ulasan:", error.message);
      return;
    }

    reviewList.replaceChildren();
    submittedReviews.hidden = !data || data.length === 0;
    (data || []).forEach((review) => {
      const card = document.createElement("article");
      card.className = "submitted-review-card";

      const top = document.createElement("div");
      top.className = "submitted-review-top";

      const name = document.createElement("span");
      name.className = "submitted-review-name";
      name.textContent = review.name || "Pelanggan";

      const stars = document.createElement("span");
      stars.className = "submitted-review-stars";
      const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));
      stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
      stars.setAttribute("aria-label", `${rating} dari 5 bintang`);
      top.append(name, stars);

      const service = document.createElement("small");
      service.className = "submitted-review-service";
      const date = review.created_at
        ? new Date(review.created_at).toLocaleDateString("id-ID")
        : "";
      service.textContent = `${review.service || "Layanan"}${date ? " · " + date : ""}`;

      const message = document.createElement("p");
      message.className = "submitted-review-text";
      message.textContent = review.message || "";

      card.append(top, service, message);
      reviewList.append(card);
    });
  }

  renderApprovedReviews();
  window.addEventListener("bhineka-reviews-updated", renderApprovedReviews);

  // Kirim ulasan pelanggan ke Supabase dengan status pending
  const reviewForm = $("review-form");
  if (reviewForm) {
    reviewForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!reviewForm.reportValidity()) return;

      const name = $("review-name").value.trim();
      const rating = reviewForm.querySelector('input[name="rating"]:checked')?.value;
      const service = $("review-service").value;
      const message = $("review-message").value.trim();
      const consent = $("review-consent").checked;
      const status = $("review-form-status");

      if (!name || !rating || !service || message.length < 10 || !consent) {
        if (status) status.textContent = "Mohon lengkapi semua kolom dan persetujuan sebelum mengirim.";
        return;
      }
      if (!supabaseClient) {
        if (status) status.textContent = "Koneksi ulasan belum dikonfigurasi. Silakan hubungi admin.";
        return;
      }

      const submitButton = reviewForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = "Mengirim...";
      }
      if (status) status.textContent = "";

      try {
        const { error } = await supabaseClient.from("reviews").insert([{
          name,
          rating: Number(rating),
          service,
          message,
          status: "pending",
        }]);
        if (error) throw error;

        if (status) status.textContent =
          "Terima kasih! Ulasan berhasil dikirim dan menunggu persetujuan admin sebelum ditampilkan.";
        reviewForm.reset();
      } catch (error) {
        console.error("Gagal mengirim ulasan ke Supabase:", error);
        if (status) status.textContent =
          `Ulasan gagal dikirim: ${error.message || "periksa koneksi Supabase dan kebijakan RLS."}`;
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButton.dataset.originalText || "Kirim Ulasan";
          delete submitButton.dataset.originalText;
        }
      }
    });
  }

  // Galeri foto
  const dialog = document.querySelector(".gallery-dialog");
  const dialogTitle = $("dialog-title");
  const dialogDescription = $("dialog-description");
  const dialogImage = $("dialog-image");
  const dialogSymbol = $("dialog-symbol");
  const galleryNames = ["Foto BHINEKA MOTOR 1", "Foto BHINEKA MOTOR 2", "Foto BHINEKA MOTOR 3", "Foto BHINEKA MOTOR 4", "Foto BHINEKA MOTOR 5"];

  document.querySelectorAll("[data-gallery]").forEach((item) => {
    item.addEventListener("click", () => {
      const index = Number(item.dataset.gallery);
      if (!dialog) return;
      if (dialogTitle) dialogTitle.textContent = galleryNames[index] || "Galeri BHINEKA MOTOR";
      const image = item.querySelector(".gallery-placeholder img");
      if (image && dialogImage) {
        dialogImage.src = image.currentSrc || image.src;
        dialogImage.alt = image.alt || galleryNames[index] || "Foto BHINEKA MOTOR";
        dialogImage.hidden = false;
        if (dialogSymbol) dialogSymbol.hidden = true;
        if (dialogDescription) dialogDescription.textContent = "Foto galeri BHINEKA MOTOR.";
      } else {
        if (dialogImage) {
          dialogImage.hidden = true;
          dialogImage.removeAttribute("src");
        }
        if (dialogSymbol) dialogSymbol.hidden = false;
        if (dialogDescription) dialogDescription.textContent =
          "Ini adalah slot galeri, bukan foto bisnis asli. Ganti dengan foto BHINEKA MOTOR sendiri sesuai panduan README.";
      }
      if (typeof dialog.showModal === "function") dialog.showModal();
    });
  });
  const closeDialog = document.querySelector(".dialog-close");
  if (closeDialog && dialog) closeDialog.addEventListener("click", () => dialog.close());
  if (dialog) dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
