"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Content" },
  { href: "/admin/crm", label: "CRM" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/agent", label: "Agent" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">SK</span>
          <span>CMS</span>
        </div>

        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`admin-nav-item${pathname === href ? " active" : ""}`}
          >
            {label}
          </Link>
        ))}

        <div className="admin-nav-footer">
          <a
            href="/"
            target="_blank"
            className="admin-btn ghost"
            style={{ display: "block", textAlign: "center", marginBottom: 8 }}
          >
            View Site
          </a>
          <button className="admin-btn ghost" style={{ width: "100%" }} onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="admin-mobile-nav">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? "active" : ""}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
