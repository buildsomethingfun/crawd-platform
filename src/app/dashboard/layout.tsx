import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              CRAWD
            </Link>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/dashboard" className="hover:text-white">
                Overview
              </Link>
              <Link href="/dashboard/api-keys" className="hover:text-white">
                API Keys
              </Link>
              <Link href="/dashboard/streams" className="hover:text-white">
                Streams
              </Link>
            </div>
          </div>
          <UserButton />
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
