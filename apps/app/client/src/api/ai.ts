const getCsrf = () => {
  const m = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
  return m?.content || undefined;
};

async function fetchJSON(url: string, opts: RequestInit = {}) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const csrf = getCsrf();
  if (csrf) headers.set("x-csrf-token", csrf);

  const res = await fetch(url, { credentials: "include", ...opts, headers, body: opts.body });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${detail}`);
  }
  return res.json();
}

export async function aiLeadsAutoresponder(payload: {
  bakeryName: string; tone?: "friendly"|"formal"|"lux"|"casual";
  customerName?: string; eventType?: string; eventDate?: string;
  guestCount?: number; styleNotes?: string; emailSignature?: string;
}) {
  return fetchJSON("/api/ai/leads/autoresponder", { method: "POST", body: JSON.stringify(payload) });
}

export async function aiLeadsScore(payload: {
  eventDate?: string; budgetBand?: "low"|"mid"|"high";
  guestCount?: number; distanceMiles?: number; specialRequests?: string;
}) {
  return fetchJSON("/api/ai/leads/score", { method: "POST", body: JSON.stringify(payload) });
}

export async function aiQuotesSuggestPrice(payload: {
  guestCount: number; icing: "buttercream"|"fondant";
  complexity?: "basic"|"standard"|"premium"|"couture";
  addOns?: { metallicLeaf?: boolean; sugarFlorals?: boolean; ediblePrint?: boolean; topperCustom?: boolean };
  deliveryMiles?: number; notes?: string;
}) {
  return fetchJSON("/api/ai/quotes/suggest-price", { method: "POST", body: JSON.stringify(payload) });
}

export async function aiMarketingCaption(payload: {
  tags: string[]; tone?: "friendly"|"elegant"|"playful"|"lux"; hashtags?: boolean; maxChars?: number;
}) {
  return fetchJSON("/api/ai/marketing/caption", { method: "POST", body: JSON.stringify(payload) });
}

export async function aiMarketingCopy(payload: {
  section: "about"|"email_signature"|"promo"|"seo_meta";
  context?: string; tone?: "friendly"|"formal"|"elegant"|"lux"|"playful"; maxChars?: number;
}) {
  return fetchJSON("/api/ai/marketing/copy", { method: "POST", body: JSON.stringify(payload) });
}
