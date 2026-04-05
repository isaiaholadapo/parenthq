"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

export function NavigationWrapper() {
  const pathname = usePathname();

  // Do not show the navigation bar on the login page
  if (pathname === "/login") {
    return null;
  }

  return <BottomNav />;
}
