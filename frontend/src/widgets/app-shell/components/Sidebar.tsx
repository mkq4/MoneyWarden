import { AddButtons } from "@/features/transaction-editor";
import { MAIN_NAV, SETTINGS_NAV } from "../model/app-shell.const";
import { NavLink } from "./NavLink";
import { SidebarLogo } from "./SidebarLogo";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-border/70 bg-sidebar px-5 py-10 md:flex">
      <SidebarLogo />
      <div className="mb-6">
        <AddButtons />
      </div>
      <nav className="flex flex-col gap-1">
        {MAIN_NAV.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className="mt-auto">
        <NavLink item={SETTINGS_NAV} />
      </div>
    </aside>
  );
}
