import React from 'react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
