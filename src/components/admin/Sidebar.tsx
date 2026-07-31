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
      className={`relative h-full bg-[#002a5c] dark:bg-[#0a1930] transition-all duration-300 flex flex-col ${isCollapsed ? 'w-[72px]' : 'w-64'} z-40`}
    >
      {/* Background element for Sidebar */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none bg-no-repeat bg-cover bg-center z-0"
        style={{ backgroundImage: 'url("/images/element/2.png")' }} 
      ></div>

      {/* Logo Area */}
      <div className="relative z-10 h-16 flex items-center justify-center border-b border-white/10 px-3 shrink-0 overflow-hidden gap-2">
        {/* Logo tetap menggunakan logo.png baik ditarik maupun dilebarkan */}
        <div className="relative w-10 h-10 transition-all duration-300 flex items-center justify-center shrink-0 bg-white rounded-full p-1 shadow-sm">
          <Image 
            src="/images/logo.png" 
            alt="Logo" 
            fill
            className="transition-all duration-300 object-contain p-1"
            priority 
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

                // Desain Inset Curve Keren untuk item aktif
                const activeClasses = `
                  bg-white dark:bg-[#121212] text-[#002a5c] dark:text-blue-400
                  rounded-l-3xl ml-4 pl-4 pr-0
                  relative
                  before:absolute before:w-[30px] before:h-[30px] before:right-0 before:-top-[30px] before:rounded-full before:shadow-[15px_15px_0_0_#ffffff] dark:before:shadow-[15px_15px_0_0_#121212] before:bg-transparent before:pointer-events-none
                  after:absolute after:w-[30px] after:h-[30px] after:right-0 after:-bottom-[30px] after:rounded-full after:shadow-[15px_-15px_0_0_#ffffff] dark:after:shadow-[15px_-15px_0_0_#121212] after:bg-transparent after:pointer-events-none
                `;
                const inactiveClasses = `
                  text-white/70 hover:bg-white/10 hover:text-white mx-3 px-3 rounded-xl
                `;
                const itemClasses = isActive ? activeClasses : inactiveClasses;
                const iconClasses = isActive ? 'text-[#002a5c] dark:text-blue-400' : 'text-white/50 group-hover:text-white';

                // Jika collapse, tidak bisa buka dropdown
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
                        className={`flex items-center ${isCollapsed ? 'justify-center ml-0 px-0 rounded-xl' : 'justify-start'} gap-3 py-2.5 transition-colors group ${itemClasses}`}
                        title={isCollapsed ? item.name : ""}
                      >
                        <i className={`${item.icon} text-lg w-6 text-center ${iconClasses}`}></i>
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
      <div className="relative z-10 p-4 border-t border-white/10 shrink-0">
        <button 
          onClick={handleLogout}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-white/10 transition-colors group`}
          title={isCollapsed ? "Log Out" : ""}
        >
          {/* Ikon Logout */}
          <i className="fa-solid fa-arrow-right-from-bracket text-lg w-6 text-center group-hover:scale-110 transition-transform"></i>
          {!isCollapsed && <span className="text-[13px] font-bold">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
