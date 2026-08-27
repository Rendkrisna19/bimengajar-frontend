import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami | Profil & Visi Misi",
  description: "Profil, Visi, Misi, dan sejarah PLAT-BK yang diinisiasi oleh Kantor Perwakilan Bank Indonesia Pematangsiantar.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
