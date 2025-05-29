'use client'
import React, { useEffect, useState } from 'react'
import Navbar from './NavBar'
import SideBar from './SideBar';
import { usePathname, useRouter } from 'next/navigation';
import Loader from './Loader';

const LayoutWrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const noLayoutRoute = "/verify-user";

  const [pageLoading, setPageLoading] = useState(false);

  // Stop loader on pathname change
  useEffect(() => {
    setPageLoading(false);
  }, [pathname]);

  // Hide layout for certain routes - MOVED AFTER HOOKS
  if (pathname.startsWith(noLayoutRoute)) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden relative md:block md:w-[240px] bg-[#111827]">
        <SideBar setPageLoading={() => setPageLoading(true)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="overflow-auto h-full relative">
          {pageLoading && (
            <div className="absolute inset-0 z-10">
              <Loader />
            </div>
          )}
          <div className={pageLoading ? "opacity-50" : ""}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;