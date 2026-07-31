'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar({ isCollapsed, toggleSidebar }: { isCollapsed: boolean, toggleSidebar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
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
      category: "CMS Profil",
      items: [
        { name: "Tentang Kami", icon: "fa-solid fa-circle-info", href: "/admin/tentang-kami" },
        { name: "Peta Edukasi", icon: "fa-solid fa-map-location-dot", href: "/admin/peta-edukasi" },
        { name: "Pojok Koin", icon: "fa-solid fa-coins", href: "/admin/pojok-koin" },
      ]
    },
    {
      category: "Aktivitas",
      items: [
        { name: "Artikel", icon: "fa-regular fa-newspaper", href: "/admin/berita" },
        { name: "Berita", icon: "fa-solid fa-bullhorn", href: "/admin/news" },
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
          href: "#", // Menggunakan hash agar tidak route directly jika di klik
          subItems: [
            { name: "Daftar Materi", href: "/admin/materi-edukasi" },
            { name: "Kategori Materi", href: "/admin/materi-edukasi/kategori" }
          ]
        },
        { name: "Pengajuan Edukasi", icon: "fa-solid fa-file-signature", href: "/admin/pengajuan-edukasi" },
        { name: "Kunjungan", icon: "fa-solid fa-building-circle-arrow-right", href: "/admin/kunjungan" },
      ]
    }
  ];

  const handleLogout = () => {
    Swal.fire({
      title: 'Yakin ingin keluar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#003366',
      confirmButtonText: 'Ya, Keluar'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/login');
      }
    });
  };

  return (
    <aside 
      className={`relative h-full bg-white dark:bg-[#1e1e1e] transition-all duration-300 flex flex-col ${isCollapsed ? 'w-[72px]' : 'w-64'} z-40 shadow-[1px_0_10px_rgba(0,0,0,0.02)] overflow-hidden`}
    >
      {/* Sidebar Texture Background (2.png) */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] pointer-events-none bg-repeat z-0"
        style={{ backgroundImage: 'url(/images/element/2.png)', backgroundSize: '120px 120px' }}
      ></div>

      {/* Sidebar Center Seal Watermark (1.png) */}
      {!isCollapsed && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] opacity-[0.04] dark:opacity-[0.02] pointer-events-none bg-no-repeat bg-center z-0"
          style={{ backgroundImage: 'url(/images/element/1.png)', backgroundSize: 'contain' }}
        ></div>
      )}

      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100 dark:border-gray-800 px-3 shrink-0 overflow-hidden relative z-10">
        {/* Logo tetap menggunakan logo.png baik ditarik maupun dilebarkan */}
        <div className={`relative ${isCollapsed ? 'w-8 h-8' : 'w-36 h-10'} transition-all duration-300 flex items-center justify-center`}>
          <Image 
            src="/images/logo.png" 
            alt="Logo" 
            fill
            className="dark:brightness-200 transition-all duration-300 object-contain"
            priority 
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar relative z-10">
        {menus.map((group, idx) => (
          <div key={idx} className="mb-8">
            {!isCollapsed && (
              <h3 className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                {group.category}
              </h3>
            )}
            <ul className="flex flex-col gap-1.5 px-3">
              {group.items.map((item, itemIdx) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubItemActive = hasSubItems && item.subItems?.some(sub => pathname.startsWith(sub.href));
                const isActive = pathname === item.href || isSubItemActive;
                const isOpen = openMenus.includes(item.name) || (isSubItemActive && !isCollapsed);

                // Jika collapse, tidak bisa buka dropdown
                return (
                  <li key={itemIdx}>
                    {hasSubItems ? (
                      <div className="flex flex-col">
                        <button 
                          onClick={() => !isCollapsed && toggleSubMenu(item.name)}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-colors group ${
                            isActive 
                            ? 'bg-primary text-white shadow-md dark:bg-blue-600' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-blue-300'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                          title={isCollapsed ? item.name : ""}
                        >
                          <div className="flex items-center gap-3">
                            <i className={`${item.icon} text-lg w-6 text-center ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`}></i>
                            {!isCollapsed && <span className="text-[13px] font-medium">{item.name}</span>}
                          </div>
                          {!isCollapsed && (
                            <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
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
                                        ? 'bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'text-gray-500 hover:text-primary hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                      }`}
                                    >
                                      <div className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-primary' : 'bg-gray-300'}`}></div>
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
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                          isActive 
                          ? 'bg-primary text-white shadow-md dark:bg-blue-600' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-blue-300'
                        }`}
                        title={isCollapsed ? item.name : ""}
                      >
                        <i className={`${item.icon} text-lg w-6 text-center ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`}></i>
                        {!isCollapsed && <span className="text-[13px] font-medium">{item.name}</span>}
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
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0 relative z-10 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-sm">
        <button 
          onClick={handleLogout}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group`}
          title={isCollapsed ? "Log Out" : ""}
        >
          {/* Ikon Logout */}
          <i className="fa-solid fa-arrow-right-from-bracket text-lg w-6 text-center group-hover:scale-110 transition-transform"></i>
          {!isCollapsed && <span className="text-[13px] font-bold">Log Out</span>}
        </button>
      </div>

      {/* Sidebar Bottom Ornament (5.png) */}
      {!isCollapsed && (
        <div 
          className="absolute -bottom-10 -right-10 w-[220px] h-[220px] opacity-[0.25] dark:opacity-[0.15] pointer-events-none bg-no-repeat bg-right-bottom z-0 mix-blend-multiply dark:mix-blend-normal"
          style={{ backgroundImage: 'url(/images/element/5.png)', backgroundSize: '160px auto' }}
        ></div>
      )}
    </aside>
  );
}
