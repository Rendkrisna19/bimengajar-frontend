import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Titik Temu | Layanan Penukaran Uang Logam",
  description: "Layanan publik Titik Temu penukaran uang logam Bank Indonesia Pematangsiantar untuk memperlancar sirkulasi uang rupiah di masyarakat.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
