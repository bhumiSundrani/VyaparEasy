import React from 'react';
import { Settings, BarChart2, ArrowUpCircle,
  ArrowDownCircle, Package, LayoutDashboard, TrendingUp,
  TrendingDown,  Layers } from 'lucide-react'; // optional icons

const SideBar = () => {
  return (
    <div className="bg-[#111827] min-h-screen flex flex-col text-white p-4 w-[17%] shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center space-x-2 mb-8">
        <img
          src="/assets_task_01jtk0k64vf999vsvfvfbv3w5b_1746542400_img_1.webp"
          className="h-10 w-10 object-cover rounded-full"
          alt="Logo"
        />
        <span className="text-xl font-bold">
          Vyapar<span className="text-orange-400">Easy</span>
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex flex-col space-y-6">
        <NavSection title="Menu" items={[
          { label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { label: 'Analytics', icon: <BarChart2 size={18} /> },
        ]} />

        <NavSection title="Quick Actions" items={[
          { label: 'Add Sales', icon: <ArrowUpCircle size={18} /> },
          { label: 'Add Purchases', icon: <ArrowDownCircle size={18} /> },
        ]} />

        <NavSection title="Inventory" items={[
          { label: 'Products', icon: <Package size={18} /> },
          { label: 'Categories', icon: <Layers size={18} /> },
        ]} />

        <NavSection title="Transactions" items={[
          { label: 'Sales', icon: <TrendingUp size={18} /> },
          { label: 'Purchases', icon: <TrendingDown size={18} /> },
        ]} />

        <div className="mt-6 flex items-center space-x-2 cursor-pointer hover:text-orange-400 transition-colors">
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </div>
      </div>
    </div>
  );
};

interface NavItem {
  label: string;
  icon: React.ReactNode;
}

interface NavSectionProps {
  title: string;
  items: NavItem[];
}


const NavSection: React.FC<NavSectionProps> = ({ title, items }) => (
  <div>
    <p className="text-gray-400 uppercase text-xs font-semibold mb-2">{title}</p>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-800 p-2 rounded-md transition-all"
        >
          {item.icon}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default SideBar;
