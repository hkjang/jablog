"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileText, GitBranch, Calendar, BarChart, 
  Activity, Users, Settings, LogOut, ChevronLeft, ChevronRight,
  Sun, Moon, Monitor
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/components/providers/ThemeProvider";
import "./Sidebar.css";
import { Button } from "@/components/ui/Button";

interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: string;
}

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  FileText: <FileText size={20} />,
  GitBranch: <GitBranch size={20} />,
  Calendar: <Calendar size={20} />,
  BarChart: <BarChart size={20} />,
  Activity: <Activity size={20} />,
  Users: <Users size={20} />,
  Settings: <Settings size={20} />,
};

// Default menus for when API is not available
const defaultMenus: MenuItem[] = [
  { id: "dashboard", name: "대시보드", path: "/dashboard", icon: "LayoutDashboard" },
  { id: "content", name: "콘텐츠", path: "/dashboard/content", icon: "FileText" },
  { id: "pipeline", name: "발행 파이프라인", path: "/dashboard/pipeline", icon: "GitBranch" },
  { id: "calendar", name: "예약 캘린더", path: "/dashboard/calendar", icon: "Calendar" },
  { id: "analytics", name: "성과 분석", path: "/dashboard/analytics", icon: "BarChart" },
  { id: "monitoring", name: "API 모니터링", path: "/dashboard/monitoring", icon: "Activity" },
  { id: "settings", name: "설정", path: "/dashboard/settings", icon: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [menus, setMenus] = useState<MenuItem[]>(defaultMenus);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Fetch role-based menus
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        // TODO: Get actual user ID from auth context
        const userId = 1;
        const res = await fetch(`http://localhost:4000/users/${userId}/menus`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMenus(data);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch role-based menus, using defaults");
      }
    };
    fetchMenus();
  }, []);

  const cycleTheme = () => {
    const themeOrder: Array<"auto" | "light" | "dark"> = ["auto", "light", "dark"];
    const currentIndex = themeOrder.indexOf(theme);
    const nextTheme = themeOrder[(currentIndex + 1) % 3];
    setTheme(nextTheme);
  };

  const getThemeIcon = () => {
    if (theme === "auto") return <Monitor size={16} />;
    if (theme === "light") return <Sun size={16} />;
    return <Moon size={16} />;
  };

  return (
    <aside className={clsx("sidebar glass-panel", collapsed && "sidebar-collapsed")}>
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-logo">J</div>
          {!collapsed && <span className="brand-name">JaBlog</span>}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="collapse-btn"
          title={collapsed ? "펼치기" : "접기"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menus.map((item) => {
          const isActive = pathname === item.path || 
            (item.path !== "/dashboard" && pathname.startsWith(item.path));
          return (
            <Link
              key={item.id}
              href={item.path}
              className={clsx("nav-item", isActive && "nav-item-active")}
              title={collapsed ? item.name : undefined}
            >
              <span className="nav-icon">{iconMap[item.icon] || <FileText size={20} />}</span>
              {!collapsed && <span className="nav-label">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={cycleTheme} 
          className={clsx("theme-toggle", collapsed && "theme-toggle-collapsed")}
          title={`테마: ${theme === "auto" ? "자동" : theme === "light" ? "라이트" : "다크"}`}
        >
          {getThemeIcon()}
          {!collapsed && (
            <span>{theme === "auto" ? "자동" : theme === "light" ? "라이트" : "다크"}</span>
          )}
        </button>
        
        <Button 
          variant="ghost" 
          className={clsx("w-full justify-start", collapsed && "justify-center px-0")}
          leftIcon={<LogOut size={20} />}
        >
          {!collapsed && "로그아웃"}
        </Button>
      </div>
    </aside>
  );
}
