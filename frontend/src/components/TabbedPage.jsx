import React, { useState } from 'react';
import Layout from './Layout';

// Wraps several already-existing page components under ONE nav item/route,
// as tabs, instead of each having its own separate menu entry. Used to
// merge previously-separate pages (e.g. Finance + Reports + Financial
// Statements + Investments) without rewriting their internals - each one
// just needs to stop wrapping itself in <Layout> (see the `bare` prop on
// ModuleListPage, or the manual strip on hand-built pages), since this
// component supplies the single shared Layout/sidebar/header instead.
//
// tabs: [{ label, component: ReactComponent }]
const TabbedPage = ({ title, subtitle, tabs }) => {
  const [active, setActive] = useState(0);
  const ActiveComponent = tabs[active].component;

  return (
    <Layout title={title} subtitle={subtitle}>
      <div className="flex gap-1 border-b border-slate-200 mb-5 overflow-x-auto">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              active === i ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ActiveComponent />
    </Layout>
  );
};

export default TabbedPage;
