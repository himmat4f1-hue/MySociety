import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend email service is wired up in this demo - this just simulates a submission.
    setSubmitted(true);
  };

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Contact Us</h1>
          <p className="text-slate-500">Questions about plans, onboarding your society, or anything else - we're happy to help.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Email</p>
                <p className="text-sm text-slate-500">hello@mysociety.app</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Phone</p>
                <p className="text-sm text-slate-500">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Office</p>
                <p className="text-sm text-slate-500">MySociety HQ, Mumbai, India</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            {submitted ? (
              <div className="card flex flex-col items-center text-center py-12">
                <CheckCircle2 size={40} className="text-green-500 mb-3" />
                <h3 className="font-semibold text-slate-800 text-lg mb-1">Message sent!</h3>
                <p className="text-sm text-slate-500">Thanks for reaching out - our team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                  <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea required rows={5} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default ContactUs;
