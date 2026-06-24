const config = window.WEDDING_CONFIG || {};
const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
const form = document.querySelector("#contribution-form");
const nameInput = document.querySelector("#guest-name");
const foodInput = document.querySelector("#guest-food");
const submitButton = document.querySelector("#submit-button");
const message = document.querySelector("#form-message");
const list = document.querySelector("#contribution-list");
const count = document.querySelector("#contribution-count");
const loadingState = document.querySelector("#loading-state");
const emptyState = document.querySelector("#empty-state");
const modeNote = document.querySelector("#mode-note");
const localStorageKey = "mariella-elias-buffet";
let supabaseClient = null;

function normalize(value) {
  return value.trim().replace(/\s+/g, " ");
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `form-message ${type}`;
}

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function renderContributions(contributions) {
  list.replaceChildren();
  emptyState.hidden = contributions.length > 0;

  contributions.forEach((contribution, index) => {
    const item = document.createElement("li");
    item.className = "contribution-item";
    item.style.animationDelay = `${Math.min(index * 45, 270)}ms`;

    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = initials(contribution.name);

    const guest = document.createElement("span");
    guest.className = "guest";
    guest.textContent = contribution.name;

    const food = document.createElement("span");
    food.className = "food";
    food.textContent = contribution.food;

    item.append(avatar, guest, food);
    list.append(item);
  });

  count.textContent = `${contributions.length} ${contributions.length === 1 ? "Beitrag" : "Beiträge"}`;
  loadingState.hidden = true;
}

function getLocalContributions() {
  try {
    return JSON.parse(localStorage.getItem(localStorageKey)) || [];
  } catch {
    return [];
  }
}

async function loadContributions() {
  if (!isSupabaseConfigured) {
    renderContributions(getLocalContributions());
    modeNote.hidden = false;
    modeNote.textContent = "Vorschaumodus – Einträge werden nur auf diesem Gerät gespeichert.";
    return;
  }

  const { data, error } = await supabaseClient
    .from("contributions")
    .select("id, name, food, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    loadingState.hidden = true;
    emptyState.hidden = false;
    showMessage("Die Buffetliste konnte gerade nicht geladen werden. Bitte versucht es gleich noch einmal.", "error");
    return;
  }

  renderContributions(data);
}

async function saveContribution(contribution) {
  if (!isSupabaseConfigured) {
    const contributions = getLocalContributions();
    contributions.push({ ...contribution, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    localStorage.setItem(localStorageKey, JSON.stringify(contributions));
    renderContributions(contributions);
    return;
  }

  const { error } = await supabaseClient.from("contributions").insert(contribution);
  if (error) throw error;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = normalize(nameInput.value);
  const food = normalize(foodInput.value);

  if (name.length < 2 || food.length < 2) {
    showMessage("Bitte tragt euren Namen und eure Köstlichkeit ein.", "error");
    (name.length < 2 ? nameInput : foodInput).focus();
    return;
  }

  submitButton.disabled = true;
  showMessage("Euer Beitrag wird hinzugefügt …", "success");

  try {
    await saveContribution({ name, food });
    form.reset();
    showMessage("Vielen Dank! Euer Beitrag wurde hinzugefügt. Wir freuen uns!", "success");
    if (isSupabaseConfigured) await loadContributions();
  } catch {
    showMessage("Das hat leider nicht geklappt. Bitte versucht es gleich noch einmal.", "error");
  } finally {
    submitButton.disabled = false;
  }
});

if (isSupabaseConfigured && window.supabase) {
  supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  supabaseClient
    .channel("contributions-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "contributions" }, loadContributions)
    .subscribe();
}

loadContributions();
