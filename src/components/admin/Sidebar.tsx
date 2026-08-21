'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export default function Sidebar({ isCollapsed, toggleSidebar }: { isCollapsed: boolean, toggleSidebar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { pendingCount } = useNotifications();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleSubMenu = (name: string) => {
    setOpenMenus(prev => 
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  const menus = [
    {
      category: "Main Menu",
      items: [
        { name: "Dashboard", icon: "fa-solid fa-border-all", href: "/admin" }
      ]
    },
    {
      category: "Content Management System",
      items: [
        { name: "Hero Banner", icon: "fa-solid fa-[#1C3281] fa-sliders", href: "/admin/cms/hero-banner" },
      ]
    },
    {
      category: "CMS Profil",
      items: [
        { name: "Tentang Kami", icon: "fa-solid fa-circle-info", href: "/admin/tentang-kami" },
        { name: "Peta Edukasi", icon: "fa-solid fa-map-location-dot", href: "/admin/peta-edukasi" },
        { name: "Titik Temu", icon: "fa-solid fa-people-arrows", href: "/admin/titik-temu" },
      ]
    },
    {
      category: "Aktivitas",
      items: [
        { name: "Artikel", icon: "fa-regular fa-newspaper", href: "/admin/artikel" },
        { name: "Berita", icon: "fa-solid fa-bullhorn", href: "/admin/berita" },
        { name: "Dokumentasi", icon: "fa-regular fa-images", href: "/admin/dokumentasi" },
        { name: "Jadwal Kalender", icon: "fa-regular fa-calendar-check", href: "/admin/kalender" },
      ]
    },
    {
      category: "Edukasi & Layanan",
      items: [
        { name: "Mitra Edukasi", icon: "fa-regular fa-handshake", href: "/admin/mitra" },
        { 
          name: "Materi Edukasi", 
          icon: "fa-solid fa-book-open", 
          href: "#",
          subItems: [
            { name: "Daftar Materi", href: "/admin/materi-edukasi" },
            { name: "Kategori Materi", href: "/admin/materi-edukasi/kategori" }
          ]
        },
        { name: "Kunjungan", icon: "fa-solid fa-building-circle-arrow-right", href: "/admin/kunjungan" },
      ]
    },
    {
      category: "Pengaturan Sistem",
      items: [
        { name: "Manajemen User", icon: "fa-solid fa-users-gear", href: "/admin/users" },
        { name: "Profil Saya", icon: "fa-solid fa-user-pen", href: "/admin/profil" },
      ]
    }
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Keluar',
      text: 'Apakah Anda yakin ingin keluar dari Admin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#003366',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
        }
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  return (
    <aside 
      className={`relative h-full bg-primary dark:bg-[#0a1930] transition-all duration-300 flex flex-col ${isCollapsed ? 'w-[72px]' : 'w-64'} z-40 overflow-hidden`}
    >
      {/* Logo Area */}
      <div className="relative z-10 h-16 flex items-center justify-center border-b border-white/10 px-3 shrink-0 overflow-hidden gap-2">
        <div className="relative w-10 h-10 transition-all duration-300 flex items-center justify-center shrink-0 bg-white rounded-full p-1 shadow-sm">
          <Image 
            src="/images/logo.png?v=2" 
            alt="Logo" 
            fill
            sizes="40px"
            className="transition-all duration-300 object-contain p-1"
            priority 
            unoptimized
          />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-[15px] text-white whitespace-nowrap tracking-wide">
            BI Mengajar
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <div className="relative z-10 flex-1 overflow-y-auto py-6 custom-scrollbar overflow-x-hidden">
        {menus.map((group, idx) => (
          <div key={idx} className="mb-8">
            {!isCollapsed && (
              <h3 className="px-6 text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3">
                {group.category}
              </h3>
            )}
            <ul className="flex flex-col gap-1.5">
              {group.items.map((item, itemIdx) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubItemActive = hasSubItems && item.subItems?.some(sub => pathname.startsWith(sub.href));
                const isActive = pathname === item.href || isSubItemActive;
                const isOpen = openMenus.includes(item.name) || (isSubItemActive && !isCollapsed);

                const activeClasses = `
                  bg-white dark:bg-[#121212] text-primary dark:text-blue-400
                  rounded-l-3xl ml-4 pl-4 pr-0
                  relative
                  before:absolute before:w-[30px] before:h-[30px] before:right-0 before:-top-[30px] before:rounded-full before:shadow-[15px_15px_0_0_#ffffff] dark:before:shadow-[15px_15px_0_0_#121212] before:bg-transparent before:pointer-events-none
                  after:absolute after:w-[30px] after:h-[30px] after:right-0 after:-bottom-[30px] after:rounded-full after:shadow-[15px_-15px_0_0_#ffffff] dark:after:shadow-[15px_-15px_0_0_#121212] after:bg-transparent after:pointer-events-none
                `;
                const inactiveClasses = `
                  text-white/70 hover:bg-white/10 hover:text-white mx-3 px-3 rounded-xl
                `;
                const itemClasses = isActive ? activeClasses : inactiveClasses;
                const iconClasses = isActive ? 'text-primary dark:text-blue-400' : 'text-white/50 group-hover:text-white';

                const isKunjungan = item.href === '/admin/kunjungan';

                return (
                  <li key={itemIdx}>
                    {hasSubItems ? (
                      <div className="flex flex-col">
                        <button 
                          onClick={() => !isCollapsed && toggleSubMenu(item.name)}
                          className={`flex items-center justify-between py-2.5 transition-colors group ${itemClasses} ${isCollapsed ? 'justify-center ml-0 px-0 rounded-xl' : ''}`}
                          title={isCollapsed ? item.name : ""}
                        >
                          <div className="flex items-center gap-3">
                            <i className={`${item.icon} text-lg w-6 text-center ${iconClasses}`}></i>
                            {!isCollapsed && <span className="text-[13px] font-medium">{item.name}</span>}
                          </div>
                          {!isCollapsed && (
                            <i className={`fa-solid fa-chevron-down text-[10px] mr-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
                          )}
                        </button>
                        
                        {/* SubItems Render */}
                        {hasSubItems && !isCollapsed && (
                          <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] mt-1' : 'max-h-0'}`}>
                            <ul className="flex flex-col gap-1 pl-11 pr-2 pt-1 pb-2">
                              {item.subItems?.map((sub, subIdx) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <li key={subIdx}>
                                    <Link 
                                      href={sub.href}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-[12px] font-medium ${
                                        isSubActive
                                        ? 'bg-white/20 text-white'
                                        : 'text-white/60 hover:text-white hover:bg-white/10'
                                      }`}
                                    >
                                      <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-white' : 'bg-white/30'}`}></div>
                                      {sub.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link 
                        href={item.href}
                        className={`flex items-center ${isCollapsed ? 'justify-center ml-0 px-0 rounded-xl' : 'justify-between'} gap-3 py-2.5 transition-colors group ${itemClasses} relative`}
                        title={isCollapsed ? item.name : ""}
                      >
                        <div className="flex items-center gap-3">
                          <i className={`${item.icon} text-lg w-6 text-center ${iconClasses}`}></i>
                          {!isCollapsed && <span className="text-[13px] font-medium">{item.name}</span>}
                        </div>

                        {/* Red Notification Badge for Kunjungan */}
                        {isKunjungan && pendingCount > 0 && (
                          isCollapsed ? (
                            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                          ) : (
                            <span className="mr-3 px-2 py-0.5 text-[10px] font-extrabold bg-red-500 text-white rounded-full animate-pulse shadow-sm min-w-[20px] text-center leading-none">
                              {pendingCount}
                            </span>
                          )
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Logout Area */}
      <div className="relative z-10 p-4 border-t border-white/10 shrink-0">
        <button 
          onClick={handleLogout}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-white/10 transition-colors group`}
          title={isCollapsed ? "Log Out" : ""}
        >
          <i className="fa-solid fa-right-from-bracket text-lg w-6 text-center group-hover:scale-110 transition-transform"></i>
          {!isCollapsed && <span className="text-[13px] font-medium">Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
