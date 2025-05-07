'use client'
import React from 'react'
import Navbar from './NavBar'
import SideBar from './SideBar';
import { usePathname } from 'next/navigation';

const LayoutWrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const noLayoutRoute = "/verify-user";

  if (pathname.startsWith(noLayoutRoute)) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden">
  {/* Sidebar wrapper with fixed width */}
  <div className="hidden relative md:block md:w-[240px] bg-[#111827]">
    <SideBar />
  </div>

  {/* Main content */}
  <div className="flex-1 flex flex-col">
    <Navbar />
    <main className="overflow-auto">{children}</main>
  </div>
</div>

  );
};

export default LayoutWrapper;
