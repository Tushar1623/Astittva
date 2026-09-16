// Lead & site visit service
function getStored(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

let leads = getStored('rb_leads', []);
let siteVisits = getStored('rb_siteVisits', []);

export const api = {
  submitLead: async (data) => {
    const newLead = { id: Date.now(), ...data, status: 'new', createdAt: new Date().toISOString() };
    leads = [newLead, ...leads];
    setStored('rb_leads', leads);
    return { success: true, message: 'Thank you! We will get in touch with you shortly.', leadId: newLead.id };
  },

  submitSiteVisit: async (data) => {
    const newVisit = { id: Date.now(), ...data, status: 'pending', createdAt: new Date().toISOString() };
    siteVisits = [newVisit, ...siteVisits];
    setStored('rb_siteVisits', siteVisits);
    return { success: true, message: 'Site visit booked successfully! Our sales team will call you to confirm.', visitId: newVisit.id };
  },
};

export function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
}

export function getWhatsAppUrl(phone, message) {
  const num = (phone || '').replace(/\D/g, '');
  const text = encodeURIComponent(message);
  return `https://wa.me/91${num}?text=${text}`;
}
