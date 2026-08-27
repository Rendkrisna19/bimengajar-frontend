import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ulasan & Testimoni BI Mengajar",
  description: "Kesan, ulasan, dan masukan masyarakat mengenai program edukasi BI Mengajar Bank Indonesia Pematangsiantar.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
