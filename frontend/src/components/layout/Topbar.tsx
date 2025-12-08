"use client";

import React from "react";
import { Bell, Search, User } from "lucide-react";
import "./Topbar.css"; 
// import { Input } from "@/components/ui/Input"; // Could reuse, but topbar search often custom

export function Topbar() {
  return (
    <header className="topbar glass-panel">
      <div className="topbar-search">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Search contents..." 
          className="search-input"
        />
      </div>

      <div className="topbar-actions">
        <button className="action-btn">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>
        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <span className="username">Admin</span>
        </div>
      </div>
    </header>
  );
}
