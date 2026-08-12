import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Facebook, Twitter, Linkedin, Share2, Mail } from 'lucide-react';

const PublicFooter = () => {
  const year = new Date().getFullYear();

  const handleShare = async () => {
    const shareData = {
      title: 'MySociety - Society Management System',
      text: 'Check out MySociety, an all-in-one society management platform!',
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // user cancelled share - ignore
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <span className="font-bold text-white">MySociety</span>
          </div>
          <p className="text-sm text-slate-400">
            All-in-one society & apartment management platform - visitors, complaints, finance, meetings, voting and more, for every role in your community.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/plans" className="hover:text-white">Plans & Offers</Link></li>
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Support</Link></li>
            <li><a href="mailto:hello@mysociety.app" className="hover:text-white flex items-center gap-1"><Mail size={14} /> hello@mysociety.app</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Share MySociety</h4>
          <div className="flex gap-3">
            <button onClick={handleShare} title="Share" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition-colors">
              <Share2 size={16} />
            </button>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition-colors">
              <Facebook size={16} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition-colors">
              <Twitter size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition-colors">
              <Linkedin size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {year} MySociety. All rights reserved.
      </div>
    </footer>
  );
};

export default PublicFooter;
