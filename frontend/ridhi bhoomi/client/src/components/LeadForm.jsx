import { useState } from 'react';
import { api, getUtmParams } from '../services/api';

export default function LeadForm({ plotNumber, propertyType }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    requirement: plotNumber ? `Interested in Plot ${plotNumber}` : '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const utm = getUtmParams();
      await api.submitLead({
        ...form,
        plotNumber,
        propertyType,
        source: document.referrer ? 'referral' : 'website',
        ...utm,
      });
      setStatus({ type: 'success', message: 'Thank you! Our sales team (9230374700) will contact you shortly.' });
      setForm({ name: '', phone: '', email: '', requirement: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl mx-auto space-y-4 bg-[#0F1F17] border border-[#C88E00]/30 p-6 sm:p-8 rounded-3xl text-white shadow-2xl">
      <div className="space-y-1">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#C88E00]">
          {plotNumber ? `Enquire About Plot ${plotNumber}` : 'Send Quick Enquiry'}
        </h3>
        <p className="text-xs text-stone-300">Fill in your details below and our team will get in touch with you.</p>
      </div>

      <div className="space-y-3.5 pt-2">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">Full Name *</label>
          <input
            required
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-stone-800 bg-[#0A150F] px-4 py-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C88E00]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Phone Number *</label>
            <input
              required
              type="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-stone-800 bg-[#0A150F] px-4 py-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C88E00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-stone-800 bg-[#0A150F] px-4 py-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C88E00]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">Requirement *</label>
          <textarea
            required
            placeholder="Tell us your requirement (e.g., 3 Katha Plot, Site Visit, Commercial Plot, Budget...)"
            rows={3}
            value={form.requirement}
            onChange={(e) => setForm({ ...form, requirement: e.target.value })}
            className="w-full rounded-xl border border-stone-800 bg-[#0A150F] px-4 py-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C88E00]"
          />
        </div>
      </div>

      {status.message && (
        <p className={`text-xs p-3 rounded-xl border font-semibold ${status.type === 'success' ? 'bg-[#388E3C]/20 text-[#388E3C] border-[#388E3C]/40' : 'bg-rose-950 text-rose-300 border-rose-500/40'}`}>
          {status.message}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-xs font-bold uppercase tracking-widest">
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}

export function SiteVisitForm({ plotNumber }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    requirement: plotNumber ? `Site visit request for Plot ${plotNumber}` : '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.submitSiteVisit({ ...form, plotNumber, source: 'website' });
      setStatus({ type: 'success', message: result.message || 'Site visit request received! Our sales team will call you to confirm.' });
      setForm({ name: '', phone: '', email: '', requirement: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Request failed. Please call 9230374700.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl mx-auto space-y-4 bg-[#0F1F17] border border-[#C88E00]/30 p-6 sm:p-8 rounded-3xl text-white shadow-2xl">
      <div className="space-y-1">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#C88E00]">Book a Free Site Visit</h3>
        <p className="text-xs text-stone-300">Experience Ridhi Bhoomi for yourself. Our team will coordinate your visit.</p>
      </div>

      <div className="space-y-3.5 pt-2">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">Full Name *</label>
          <input
            required
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-stone-800 bg-[#0A150F] px-4 py-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C88E00]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Phone Number *</label>
            <input
              required
              type="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-stone-800 bg-[#0A150F] px-4 py-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C88E00]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-stone-800 bg-[#0A150F] px-4 py-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C88E00]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">Requirement *</label>
          <textarea
            required
            placeholder="Specify your visit requirement (e.g., Preferred date/time, plot preference, free pick-up location...)"
            rows={3}
            value={form.requirement}
            onChange={(e) => setForm({ ...form, requirement: e.target.value })}
            className="w-full rounded-xl border border-stone-800 bg-[#0A150F] px-4 py-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C88E00]"
          />
        </div>
      </div>

      {status.message && (
        <p className={`text-xs p-3 rounded-xl border font-semibold ${status.type === 'success' ? 'bg-[#388E3C]/20 text-[#388E3C] border-[#388E3C]/40' : 'bg-rose-950 text-rose-300 border-rose-500/40'}`}>
          {status.message}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-xs font-bold uppercase tracking-widest">
        {loading ? 'Submitting...' : 'Confirm Site Visit Request'}
      </button>
    </form>
  );
}

