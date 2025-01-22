"use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const router = useRouter();

  return (
    <div className="">
      {/* Sidebar */}
      {/* <nav className="w-1/4 bg-gray-100 h-screen p-4">
        <ul className="space-y-4">
          <li>
            <Link href="/dashboard">Dashboard Home</Link>
          </li>
          <li>
            <Link href="/dashboard/farms">Farms</Link>
          </li>
        </ul>
      </nav> */}

      {/* Main Content */}
      <div className={` ${poppins.className}`}>{children}</div>
    </div>
  );
}
