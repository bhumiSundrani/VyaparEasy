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
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Stop loader on pathname change
  useEffect(() => {
    console.log('Pathname changed:', pathname, 'Setting pageLoading to false');
    setPageLoading(false);
  }, [pathname]);

  // Fallback to auto-hide loader after a reasonable time
  useEffect(() => {
    if (pageLoading) {
      const timeout = setTimeout(() => {
        console.log('Auto-hiding loader after timeout');
        setPageLoading(false);
      }, 2000); // Hide after 2 seconds max
      
      return () => clearTimeout(timeout);
    }
  }, [pageLoading]);

  // Additional effect to handle when page is fully loaded
  useEffect(() => {
    const handleLoad = () => {
      console.log('Page load event detected, hiding loader');
      setPageLoading(false);
    };

    // Listen for page load events
    window.addEventListener('load', handleLoad);
    
    // Also listen for route change completion in Next.js
    const handleRouteChangeComplete = () => {
      console.log('Route change completed, hiding loader');
      setPageLoading(false);
    };

    // Check if router events are available (Next.js app router might not have these)
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChangeComplete);
    }
    
    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('popstate', handleRouteChangeComplete);
    };
  }, []);

  // Mobile-specific handling
  useEffect(() => {
    if (isMobile && pageLoading) {
      // Force clear loader on mobile
      setPageLoading(false);
    }
  }, [isMobile, pageLoading]);

  // Add cleanup effect for loader state
  useEffect(() => {
    return () => {
      setPageLoading(false);
    };
  }, []);

  // Hide layout for certain routes - MOVED AFTER HOOKS
  if (pathname.startsWith(noLayoutRoute)) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden relative md:block md:w-[240px] bg-[#111827]">
        <SideBar setPageLoading={setPageLoading} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="overflow-auto h-full relative">
          {/* Only show loader overlay on desktop */}
          {pageLoading && !isMobile && (
            <div className="fixed inset-0 z-50 bg-white bg-opacity-80 flex items-center justify-center">
              <Loader />
            </div>
          )}
          {/* Only apply opacity-50 if loader is visible and not on mobile */}
          <div className={pageLoading && !isMobile ? "opacity-50" : ""}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;