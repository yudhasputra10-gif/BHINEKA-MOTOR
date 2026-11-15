(() => {
  "use strict";

  // ==========================================
  // KONFIGURASI
  // ==========================================

  const supabaseClient = window.bhinekaSupabase;
  const $ = (id) => document.getElementById(id);

  const panel = $("admin-panel");
  const loginForm = $("integrated-admin-login");

  if (!panel || !loginForm) {
    console.error("Elemen dashboard admin tidak ditemukan.");
    return;
  }

  if (!supabaseClient) {
    console.error("Supabase belum dikonfigurasi.");
  }

  let activeFilter = "pending";
  let loading = false;

  // ==========================================
  // NOTIFIKASI
  // ==========================================

  const setError = (message) => {
    const el = $("integrated-admin-error");
    if (el) el.textContent = message || "";
  };

  const showLogin = () => {
    if ($("admin-login-view")) {
      $("admin-login-view").hidden = false;
    }

    if ($("integrated-admin-dashboard")) {
      $("integrated-admin-dashboard").hidden = true;
    }
  };

  const showDashboard = () => {
    if ($("admin-login-view")) {
      $("admin-login-view").hidden = true;
    }

    if ($("integrated-admin-dashboard")) {
      $("integrated-admin-dashboard").hidden = false;
    }
  };

  const openPanel = () => {
    panel.hidden = false;
    document.body.classList.add("admin-panel-open");
  };

  const closePanel = () => {
    panel.hidden = true;
    document.body.classList.remove("admin-panel-open");
  };

  const isAdmin = (user) => {
    return user?.app_metadata?.role === "admin";
  };

  // ==========================================
  // PEMBUKAAN DASHBOARD
  // ==========================================

  $("open-admin-panel")?.addEventListener("click", async () => {
    openPanel();
    setError("");

    if (!supabaseClient) {
      showLogin();
      setError("Supabase belum terhubung. Periksa konfigurasi.");
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error) throw error;

      const session = data.session;

      if (session && isAdmin(session.user)) {
        showDashboard();
        await renderReviews();
      } else {
        showLogin();

        if (session) {
          setError("Akun belum memiliki hak admin. Periksa app_metadata.");
        }
      }
    } catch (error) {
      showLogin();
      setError(error.message);
      console.error("Admin session:", error);
    }
  });

  $("close-admin-panel")?.addEventListener("click", closePanel);

  // ==========================================
  // LOGIN ADMIN
  // ==========================================

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!supabaseClient) {
      setError("Supabase belum terhubung.");
      return;
    }

    const email = $("integrated-admin-email")?.value.trim();
    const password = $("integrated-admin-password")?.value;

    const button = loginForm.querySelector('button[type="submit"]');

    if (button) {
      button.disabled = true;
      button.textContent = "Memeriksa...";
    }

    setError("");

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!isAdmin(data.user)) {
        await supabaseClient.auth.signOut();

        throw new Error(
          "Akun ini belum memiliki role admin. Periksa app_metadata.role di Supabase.",
        );
      }

      if ($("integrated-admin-password")) {
        $("integrated-admin-password").value = "";
      }

      activeFilter = "pending";

      showDashboard();

      await renderReviews();
    } catch (error) {
      setError(error.message || "Login gagal.");
      console.error("Admin login:", error);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Masuk Dashboard";
      }
    }
  });

  // ==========================================
  // MENGAMBIL DATA ULASAN DARI SUPABASE
  // ==========================================

  async function renderReviews() {
    if (!supabaseClient || loading) return;

    const list = $("integrated-admin-list");

    if (!list) {
      console.error("Elemen integrated-admin-list tidak ditemukan.");
      return;
    }

    loading = true;
    list.replaceChildren();

    const titleMap = {
      pending: "Ulasan menunggu",
      approved: "Ulasan disetujui",
      rejected: "Ulasan ditolak",
    };

    const title = $("integrated-admin-list-title");

    if (title) {
      title.textContent = titleMap[activeFilter];
    }

    try {
      // Pastikan sesi pengguna masih memiliki role admin.
      const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData.session;

      if (!session || !isAdmin(session.user)) {
        showLogin();
        setError("Sesi admin tidak valid. Silakan login kembali.");
        return;
      }

      // Ambil semua ulasan.
      const { data, error } = await supabaseClient
        .from("reviews")
        .select("id,name,rating,service,message,status,created_at")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;

      const rows = data || [];

      // ========================================
      // JUMLAH ULASAN
      // ========================================

      ["pending", "approved", "rejected"].forEach((status) => {
        const count = $("admin-count-" + status);

        if (count) {
          count.textContent = rows.filter(
            (review) => review.status === status,
          ).length;
        }
      });

      // ========================================
      // FILTER ULASAN
      // ========================================

      const matches = rows.filter((review) => review.status === activeFilter);

      if (!matches.length) {
        const empty = document.createElement("p");

        empty.className = "admin-empty";
        empty.textContent = "Belum ada ulasan dalam kategori ini.";

        list.append(empty);
        return;
      }

      // ========================================
      // TAMPILKAN KARTU ULASAN
      // ========================================

      matches.forEach((review) => {
        const card = document.createElement("article");

        card.className = "admin-review";

        const head = document.createElement("div");

        head.className = "admin-review-head";

        const name = document.createElement("strong");

        name.textContent = review.name || "Pelanggan";

        const stars = document.createElement("span");

        stars.className = "admin-stars";

        const rating = Math.max(0, Math.min(5, Number(review.rating) || 0));

        stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);

        head.append(name, stars);

        const meta = document.createElement("p");

        meta.className = "admin-muted";

        const date = review.created_at
          ? new Date(review.created_at).toLocaleString("id-ID")
          : "";

        meta.textContent =
          `${review.service || "Layanan"}` + (date ? " · " + date : "");

        const message = document.createElement("p");

        message.textContent = review.message || "";

        card.append(head, meta, message);

        // ======================================
        // TOMBOL AKSI ADMIN
        // ======================================

        const actions = document.createElement("div");

        actions.className = "admin-actions";

        if (review.status !== "approved") {
          const approve = document.createElement("button");

          approve.type = "button";
          approve.textContent = "Setujui";

          approve.addEventListener("click", () => {
            updateStatus(review.id, "approved", approve);
          });

          actions.append(approve);
        }

        if (review.status !== "rejected") {
          const reject = document.createElement("button");

          reject.type = "button";
          reject.textContent = "Tolak";

          reject.addEventListener("click", () => {
            updateStatus(review.id, "rejected", reject);
          });

          actions.append(reject);
        }

        card.append(actions);
        list.append(card);
      });
    } catch (error) {
      console.error("Gagal mengambil ulasan:", error);

      const message = document.createElement("p");

      message.className = "admin-empty";

      message.textContent = "Gagal mengambil ulasan: " + error.message;

      list.append(message);
    } finally {
      loading = false;
    }
  }

  // ==========================================
  // SETUJUI / TOLAK ULASAN
  // ==========================================

  async function updateStatus(id, status, button) {
    if (!supabaseClient) return;

    button.disabled = true;

    try {
      const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session || !isAdmin(sessionData.session.user)) {
        throw new Error("Sesi admin tidak valid.");
      }

      const { data, error } = await supabaseClient
        .from("reviews")
        .update({
          status: status,
        })
        .eq("id", id)
        .select("id,status");

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "Status tidak berubah. Periksa izin UPDATE pada RLS Supabase.",
        );
      }

      await renderReviews();

      window.dispatchEvent(new CustomEvent("bhineka-reviews-updated"));
    } catch (error) {
      console.error("Update status:", error);

      alert("Gagal mengubah status ulasan: " + error.message);

      button.disabled = false;
    }
  }

  // ==========================================
  // FILTER PENDING / APPROVED / REJECTED
  // ==========================================

  document.querySelectorAll("[data-admin-filter]").forEach((button) => {
    button.addEventListener("click", async () => {
      activeFilter = button.dataset.adminFilter;

      await renderReviews();
    });
  });

  // ==========================================
  // LOGOUT ADMIN
  // ==========================================

  $("integrated-admin-logout")?.addEventListener("click", async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }

    showLogin();
    closePanel();
    setError();

    loginForm.reset();
  });

  // ==========================================
  // PEMERIKSAAN SESI SAAT HALAMAN DIBUKA
  // ==========================================

  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        if (!panel.hidden) {
          showLogin();
        }

        return;
      }

      if (isAdmin(session.user) && !panel.hidden) {
        showDashboard();
        renderReviews();
      }
    });
  }
})();
