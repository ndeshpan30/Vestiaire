import React, { useState } from "react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  items: NavItem[];
  activeId: string;
}

export function Sidebar({ items, activeId }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      aria-label="Primary Navigation"
      className={`
        h-screen shrink-0 border-r border-neutral-200 bg-white
        transition-[width] duration-200 ease-out flex flex-col justify-between
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      <div>
        {/* Brand Header & Toggle */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-100">
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-wider text-neutral-900 uppercase">
                VESTIAIRE
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#5B1422] uppercase">
                EDITORIAL
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B1422]"
          >
            <span aria-hidden="true" className="text-base font-bold">
              {collapsed ? "»" : "«"}
            </span>
          </button>
        </div>

        {/* Navigation Items with Left Border Active Indicator */}
        <ul className="flex flex-col gap-1 p-2 mt-2">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id}>
                <a
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold
                    transition-all duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B1422]
                    ${
                      isActive
                        ? "bg-neutral-100 text-[#5B1422] border-l-3 border-[#5B1422] -ml-0.5 pl-[10px]"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    }
                  `}
                >
                  <span className="shrink-0 text-base">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
