import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita & Kegiatan Terbaru",
  description: "Kumpulan berita resmi, pengumuman, dan berita kegiatan terkini Kantor Perwakilan Bank Indonesia Pematangsiantar.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
