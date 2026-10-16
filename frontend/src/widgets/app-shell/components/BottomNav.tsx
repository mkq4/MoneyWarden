"use client";

import { usePathname } from "next/navigation";
import { BOTTOM_NAV_HIDDEN_ON, MAIN_NAV, SETTINGS_NAV } from "../model/app-shell.const";
import { BottomNavLink } from "./BottomNavLink";

/** Телефон: вкладки внизу экрана — замена сайдбару, под большим пальцем. */
export function BottomNav() {
  const pathname = usePathname();
  if (pathname !== null && BOTTOM_NAV_HIDDEN_ON.includes(pathname)) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
      <div className="mx-auto flex max-w-lg">
        {[...MAIN_NAV, SETTINGS_NAV].map((item) => (
          <BottomNavLink key={item.href} item={item} />
        ))}
      </div>
    </nav>
  );
}
