import React from 'react';
import { Bell } from 'lucide-react';

export function AlertsPanel() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#0a0a12] text-center p-4">
      <Bell size={24} className="text-zinc-700 mb-2" />
      <p className="text-[10px] text-zinc-600 font-bold">Price Alerts</p>
      <p className="text-[9px] text-zinc-700 mt-1">Coming in v2.1</p>
    </div>
  );
}
