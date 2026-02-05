import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white/90">
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-accent">
              crawd.bot
            </Link>
            <div className="flex gap-6 text-sm text-white/50">
              <Link href="/dashboard" className="hover:text-white/90 transition-colors">
                Overview
              </Link>
              <Link href="/dashboard/streams" className="hover:text-white/90 transition-colors">
                Streams
              </Link>
              <Link href="/dashboard/api-keys" className="hover:text-white/90 transition-colors">
                API Keys
              </Link>
              <Link href="/dashboard/settings" className="hover:text-white/90 transition-colors">
                Settings
              </Link>
            </div>
          </div>
          <UserButton />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
