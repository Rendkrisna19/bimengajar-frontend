import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Materi Edukasi Kebanksentralan",
  description: "Unduh dan pelajari modul, materi presentasi, serta bahan bacaan resmi kebanksentralan dan Rupiah dari Bank Indonesia.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
