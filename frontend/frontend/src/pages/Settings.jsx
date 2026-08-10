import React from 'react';
import { User, Settings as SettingsIcon, Bell, Users, Shield, CreditCard, Database, Link2, Monitor } from 'lucide-react';
import Layout from '../components/Layout';

const cards = [
  { icon: User, title: 'Profile & Account', desc: 'Manage your profile information, change password and account preferences.' },
  { icon: SettingsIcon, title: 'General Settings', desc: 'Configure general application settings and system preferences.' },
  { icon: Bell, title: 'Notifications', desc: 'Manage notification preferences and alert configurations.' },
  { icon: Users, title: 'Users & Roles', desc: 'Manage users, roles, permissions and access levels.' },
  { icon: Shield, title: 'Security Settings', desc: 'Configure security policies, 2FA, and session management.' },
  { icon: CreditCard, title: 'Billing & Subscription', desc: 'Manage subscription plans, billing details and payment methods.' },
  { icon: Database, title: 'Data Management', desc: 'Backup, restore and manage your application data.' },
  { icon: Link2, title: 'Integrations', desc: 'Manage third-party integrations and API connections.' },
  { icon: Monitor, title: 'System Preferences', desc: 'Configure system preferences and default behaviors.' },
];

const Settings = () => {
  return (
    <Layout title="Settings" subtitle="Configure system preferences and application settings">
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.title} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <c.icon size={20} />
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">{c.title}</h4>
            <p className="text-sm text-slate-500">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Application Version</p>
            <p className="font-medium">v1.0.0</p>
          </div>
          <div>
            <p className="text-slate-500">Environment</p>
            <p className="font-medium">Development</p>
          </div>
          <div>
            <p className="text-slate-500">Database Status</p>
            <p className="font-medium text-green-600">Connected</p>
          </div>
          <div>
            <p className="text-slate-500">Stack</p>
            <p className="font-medium">MongoDB + Express + React</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
