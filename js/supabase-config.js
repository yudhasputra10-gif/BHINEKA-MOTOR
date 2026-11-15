// Gunakan Supabase Publishable key (sb_publishable_...) atau legacy anon key.
// JANGAN PERNAH memasukkan service_role / secret key ke dalam website.
(() => {
  const SUPABASE_URL = "https://svlxtguoqohydjryujry.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_6D_7At52Z8oPBpA4uZiZgw_AYlDQvHd";

  if (!window.supabase?.createClient) {
    console.error("Library Supabase JS belum dimuat.");
    return;
  }
  if (
    !SUPABASE_PUBLISHABLE_KEY ||
    SUPABASE_PUBLISHABLE_KEY.startsWith("GANTI_")
  ) {
    console.error(
      "Isi SUPABASE_PUBLISHABLE_KEY di js/supabase-config.js terlebih dahulu.",
    );
    return;
  }
  window.bhinekaSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
  );
})();
