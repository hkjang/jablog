"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import "./layout.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
