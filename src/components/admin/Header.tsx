'use client';
import { useTheme } from '@/components/ThemeProvider';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <header className="h-16 bg-white dark:bg-[#1e1e1e] flex items-center justify-between px-4 lg:px-6 shrink-0 transition-colors shadow-sm relative z-10">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <i className="fa-solid fa-bars text-lg"></i>
        </button>

        <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 focus-within:border-primary/50 transition-colors">
          <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none ml-2 text-sm text-gray-700 dark:text-gray-200 w-48 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Dark Mode Toggle via ThemeProvider */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          title="Toggle Theme"
        >
          <i className={`fa-solid ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-gray-600'} text-lg transition-all duration-300 ${isDarkMode ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}></i>
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
          <i className="fa-regular fa-bell text-xl"></i>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 md:mx-2"></div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent dark:border-gray-800">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
             A
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100">Administrator</span>
            <span className="text-[11px] text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
