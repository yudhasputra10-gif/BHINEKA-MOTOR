(() => {
  "use strict";
  const supabaseClient = window.bhinekaSupabase;
  const $ = (id) => document.getElementById(id);

  const panel = $("admin-panel");
  const loginForm = $("integrated-admin-login");
  if (!panel || !loginForm) return;

  let activeFilter = "pending";

  const setError = (message) => {
    const el = $("integrated-admin-error");
    if (el) el.textContent = message || "";
  };

  const showLogin = () => {
    $("admin-login-view").hidden = false;
    $("integrated-admin-dashboard").hidden = true;
  };

  const showDashboard = () => {
    $("admin-login-view").hidden = true;
    $("integrated-admin-dashboard").hidden = false;
  };

  const openPanel = () => {
    panel.hidden = false;
    document.body.classList.add("admin-panel-open");
  };

  const closePanel = () => {
    panel.hidden = true;
    document.body.classList.remove("admin-panel-open");
  };

  $("open-admin-panel")?.addEventListener("click", async () => {
    openPanel();
    if (!supabaseClient) {
      setError("Supabase belum terhubung. Periksa js/supabase-config.js.");
      return;
    }
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      showDashboard();
      await renderReviews();
    } else {
      showLogin();
    }
  });

  $("close-admin-panel")?.addEventListener("click", closePanel);

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabaseClient) {
      setError("Supabase belum terhubung. Periksa konfigurasi Supabase.");
      return;
    }

    const email = $("integrated-admin-email").value.trim();
    const password = $("integrated-admin-password").value;
    const button = loginForm.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.textContent = "Memeriksa...";
    }
    setError("");

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Validasi role admin dari app_metadata yang ditandatangani Supabase.
      const role = data.user?.app_metadata?.role;
      if (role !== "admin") {
        await supabaseClient.auth.signOut();
        throw new Error("Akun ini belum diberi hak admin. Atur app_metadata role=admin di Supabase.");
      }

      $("integrated-admin-password").value = "";
      showDashboard();
      await renderReviews();
    } catch (error) {
      setError(error.message || "Login gagal. Periksa email dan kata sandi.");
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Masuk Dashboard";
      }
    }
  });

  async function renderReviews() {
    if (!supabaseClient) return;
    const list = $("integrated-admin-list");
    if (!list) return;
    list.replaceChildren();

    const titleMap = {
      pending: "Ulasan menunggu",
      approved: "Ulasan disetujui",
      rejected: "Ulasan ditolak",
    };
    $("integrated-admin-list-title").textContent = titleMap[activeFilter];

    const { data, error } = await supabaseClient
      .from("reviews")
      .select("id,name,rating,service,message,status,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      const p = document.createElement("p");
      p.className = "admin-empty";
      p.textContent = `Gagal mengambil ulasan: ${error.message}`;
      list.append(p);
      console.error("Admin fetch reviews:", error);
      return;
    }

    const rows = data || [];
    ["pending", "approved", "rejected"].forEach((status) => {
      const count = $("admin-count-" + status);
      if (count) count.textContent = rows.filter((r) => r.status === status).length;
    });

    const matches = rows.filter((r) => r.status === activeFilter);
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "admin-empty";
      empty.textContent = "Belum ada ulasan dalam kategori ini.";
      list.append(empty);
      return;
    }

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
      const date = review.created_at ? new Date(review.created_at).toLocaleString("id-ID") : "";
      meta.textContent = `${review.service || "Layanan"}${date ? " · " + date : ""}`;

      const message = document.createElement("p");
      message.textContent = review.message || "";
      card.append(head, meta, message);

      const actions = document.createElement("div");
      actions.className = "admin-actions";

      if (review.status !== "approved") {
        const approve = document.createElement("button");
        approve.type = "button";
        approve.textContent = "Setujui";
        approve.addEventListener("click", () => updateStatus(review.id, "approved", approve));
        actions.append(approve);
      }
      if (review.status !== "rejected") {
        const reject = document.createElement("button");
        reject.type = "button";
        reject.textContent = "Tolak";
        reject.addEventListener("click", () => updateStatus(review.id, "rejected", reject));
        actions.append(reject);
      }
      card.append(actions);
      list.append(card);
    });
  }

  async function updateStatus(id, status, button) {
    button.disabled = true;
    try {
      const { error } = await supabaseClient
        .from("reviews")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      await renderReviews();
      window.dispatchEvent(new CustomEvent("bhineka-reviews-updated"));
    } catch (error) {
      alert(`Gagal mengubah status ulasan: ${error.message}`);
      button.disabled = false;
    }
  }

  document.querySelectorAll("[data-admin-filter]").forEach((button) => {
    button.addEventListener("click", async () => {
      activeFilter = button.dataset.adminFilter;
      await renderReviews();
    });
  });

  $("integrated-admin-logout")?.addEventListener("click", async () => {
    if (supabaseClient) await supabaseClient.auth.signOut();
    showLogin();
    closePanel();
    setError("");
    loginForm.reset();
  });

  // Jika sesi admin masih aktif setelah halaman direfresh.
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user?.app_metadata?.role === "admin" && !panel.hidden) {
        showDashboard();
        await renderReviews();
      }
    });
  }
})();
