import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Perpustakaan Bank Indonesia Pematangsiantar",
  description: "Layanan informasi, referensi buku kebanksentralan, ekonomi moneter, dan akses perpustakaan digital iBI Library KPw BI Pematangsiantar.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
