import React, { useState } from 'react';
import {
  Settings, BarChart2, ArrowUpCircle,
  ArrowDownCircle, Package, LayoutDashboard, TrendingUp,
  TrendingDown, Layers, Menu
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  redirectUrl: string;
}

interface NavSectionProps {
  title: string;
  items: NavItem[];
  onItemClick?: () => void; // Add this
}

const NavSection: React.FC<NavSectionProps> = ({ title, items, onItemClick }) => {
  const router = useRouter()
  return (
  <div>
    <p className="text-gray-400 uppercase text-xs font-semibold mb-2">{title}</p>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-800 p-2 rounded-md transition-all"
          onClick={() =>{ 
            router.replace(item.redirectUrl)
            onItemClick?.();
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  </div>
)};

interface SideBarProps {
  setPageLoading: () => void
}

const SideBar: React.FC<SideBarProps> = ({ setPageLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button for Mobile */}
      <div className="md:hidden flex items-center p-4 text-black h-0">
        <button onClick={() => setIsOpen(!isOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          bg-[#111827] text-white p-4 shadow-lg z-40 h-full
          fixed top-0 left-0 md:static sm:w-[30%] md:w-full
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 md:translate-x-0 md:block
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-8">
            <img
              src="/assets_task_01jtk0k64vf999vsvfvfbv3w5b_1746542400_img_1.webp"
              className="h-10 w-10 object-cover rounded-full"
              alt="Logo"
            />
            <span className="text-xl font-bold md:block">
              Vyapar<span className="text-orange-400">Easy</span>
            </span>
          </div>

          {/* Nav Sections */}
          <div className="flex flex-col space-y-6">
            <NavSection
              title="Menu"
              items={[
                { label: 'Dashboard', icon: <LayoutDashboard size={18} />, redirectUrl: "/dashboard" },
                { label: 'Analytics', icon: <BarChart2 size={18} />, redirectUrl: "" },
              ]}
              onItemClick={() => {
                setPageLoading();
                setIsOpen(false);
              }}
            />

            <NavSection
              title="Quick Actions"
              items={[
                { label: 'Add Sales', icon: <ArrowUpCircle size={18} />, redirectUrl: "/add-sale" },
                { label: 'Add Purchases', icon: <ArrowDownCircle size={18} />, redirectUrl: "/add-purchase" },
              ]}
              onItemClick={() => {
                setPageLoading();
                setIsOpen(false);
              }}
            />

            <NavSection
              title="Inventory"
              items={[
                { label: 'Products', icon: <Package size={18} />, redirectUrl: "/all-products" },
                { label: 'Categories', icon: <Layers size={18} />, redirectUrl: "/all-categories" },
              ]}
              onItemClick={() => {
                setPageLoading();
                setIsOpen(false);
              }}
            />

            <NavSection
              title="Transactions"
              items={[
                { label: 'Sales', icon: <TrendingUp size={18} />, redirectUrl: "/all-sales" },
                { label: 'Purchases', icon: <TrendingDown size={18} />, redirectUrl: "/all-purchase" },
              ]}
              onItemClick={() => {
                setPageLoading();
                setIsOpen(false);
              }}
            />

            <div className="mt-6 flex items-center space-x-2 cursor-pointer hover:text-orange-400 transition-colors">
              <Settings size={18} />
              <span className="text-sm font-medium">Settings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}

export default SideBar;
