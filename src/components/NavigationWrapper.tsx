"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { DesktopNav } from "./DesktopNav";

export function NavigationWrapper() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <>
      <DesktopNav />
      <BottomNav />
    </>
  );
}
