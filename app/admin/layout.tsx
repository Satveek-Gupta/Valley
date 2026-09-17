import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal — CABINET VALLEY 2026",
  description: "Internal administration and verification console for Cabinet Valley.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
