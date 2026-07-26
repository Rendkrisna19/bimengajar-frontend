'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function Sidebar({ isCollapsed, toggleSidebar }: { isCollapsed: boolean, toggleSidebar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const menus = [
    {
      category: "Main Menu",
      items: [
        { name: "Dashboard", icon: "fa-solid fa-border-all", href: "/admin" }
      ]
    },
    {
      category: "CMS Konten",
      items: [
        { name: "Tentang Kami", icon: "fa-solid fa-circle-info", href: "/admin/tentang-kami" },
        { name: "Materi Edukasi", icon: "fa-solid fa-book-open", href: "/admin/edukasi" },
        { name: "Artikel Berita", icon: "fa-regular fa-newspaper", href: "/admin/berita" },
        { name: "Peta Edukasi", icon: "fa-solid fa-map-location-dot", href: "/admin/peta-edukasi" },
        { name: "Pojok Koin", icon: "fa-solid fa-coins", href: "/admin/pojok-koin" },
      ]
    },
    {
      category: "Layanan",
      items: [
        { name: "Jadwal Kalender", icon: "fa-regular fa-calendar-check", href: "/admin/kalender" },
        { name: "Pengajuan", icon: "fa-solid fa-building-circle-arrow-right", href: "/admin/kunjungan" },
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
      className={`relative h-full bg-white dark:bg-[#1e1e1e] transition-all duration-300 flex flex-col ${isCollapsed ? 'w-[72px]' : 'w-64'} z-40 shadow-[1px_0_10px_rgba(0,0,0,0.02)]`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100 dark:border-gray-800 px-3 shrink-0 overflow-hidden">
        {/* Logo tetap menggunakan logo.png baik ditarik maupun dilebarkan */}
        <div className={`relative ${isCollapsed ? 'w-10 h-10' : 'w-32 h-10'} transition-all duration-300 flex items-center justify-center`}>
          <Image 
            src="/images/logo.png" 
            alt="Logo" 
            fill
            className={`dark:brightness-200 transition-all duration-300 ${isCollapsed ? 'object-cover object-left' : 'object-contain'}`}
            priority 
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        {menus.map((group, idx) => (
          <div key={idx} className="mb-8">
            {!isCollapsed && (
              <h3 className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                {group.category}
              </h3>
            )}
            <ul className="flex flex-col gap-1.5 px-3">
              {group.items.map((item, itemIdx) => {
                const isActive = pathname === item.href;
                return (
                  <li key={itemIdx}>
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
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Logout Area */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
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
    </aside>
  );
}
