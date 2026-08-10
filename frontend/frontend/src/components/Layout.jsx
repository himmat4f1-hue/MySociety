import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
