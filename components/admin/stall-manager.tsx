"use client";

import { useState } from "react";
import { Store, CheckCircle2, AlertCircle, IndianRupee, User, Phone } from "lucide-react";

interface Stall {
  id: string;
  number: string;
  type: "main" | "food";
  status: "available" | "pending" | "allocated" | "paid";
  businessName?: string;
  contact?: string;
  phone?: string;
  price: number;
}

const initialMainStalls: Stall[] = Array.from({ length: 50 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    id: `M-${num}`,
    number: `M-${num}`,
    type: "main",
    price: 4000,
    status: "available",
  };
});

const initialFoodStalls: Stall[] = Array.from({ length: 10 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    id: `F-${num}`,
    number: `F-${num}`,
    type: "food",
    price: 4000,
    status: "available",
  };
});

export default function StallManager() {
  const [mainStalls, setMainStalls] = useState<Stall[]>(initialMainStalls);
  const [foodStalls, setFoodStalls] = useState<Stall[]>(initialFoodStalls);
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
  const [activeTab, setActiveTab] = useState<"main" | "food">("main");

  const currentList = activeTab === "main" ? mainStalls : foodStalls;

  const totalAllocated = currentList.filter((s) => s.status === "allocated" || s.status === "paid").length;
  const totalPaid = currentList.filter((s) => s.status === "paid").length;
  const totalRevenue = totalPaid * 4000;

  const setStatus = (stallId: string, newStatus: Stall["status"]) => {
    const updateFn = (prev: Stall[]) =>
      prev.map((s) => {
        if (s.id === stallId) {
          const updated = {
            ...s,
            status: newStatus,
            businessName:
              newStatus === "available"
                ? undefined
                : s.businessName || `Student Venture ${s.number}`,
          };
          if (selectedStall?.id === stallId) setSelectedStall(updated);
          return updated;
        }
        return s;
      });

    if (activeTab === "main") setMainStalls(updateFn);
    else setFoodStalls(updateFn);
  };

  const updateMerchantName = (stallId: string, name: string) => {
    const updateFn = (prev: Stall[]) =>
      prev.map((s) => {
        if (s.id === stallId) {
          const updated = { ...s, businessName: name };
          if (selectedStall?.id === stallId) setSelectedStall(updated);
          return updated;
        }
        return s;
      });

    if (activeTab === "main") setMainStalls(updateFn);
    else setFoodStalls(updateFn);
  };

  return (
    <div className="space-y-6">
      
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">TOTAL STALL CAPACITY</div>
          <div className="font-display text-3xl font-black text-brand-ink mt-1">{currentList.length} UNITS</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">ALLOCATED / RESERVED</div>
          <div className="font-display text-3xl font-black text-brand-violet mt-1">
            {totalAllocated} / {currentList.length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">PAID & CONFIRMED</div>
          <div className="font-display text-3xl font-black text-emerald-600 mt-1">{totalPaid} STALLS</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">REALIZED REVENUE</div>
          <div className="font-display text-3xl font-black text-brand-ink mt-1">
            ₹{totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          onClick={() => setActiveTab("main")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "main" ? "bg-brand-violet text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          MAIN STALLS (50 UNITS · GERMAN HANGAR)
        </button>
        <button
          onClick={() => setActiveTab("food")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === "food" ? "bg-brand-violet text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          FOOD STALLS (10 UNITS · D5 STAGE GROUND)
        </button>
      </div>

      {/* Interactive Grid & Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stall Layout Floor Grid */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display text-lg font-bold uppercase text-brand-ink">
              {activeTab === "main" ? "GERMAN HANGAR FLOOR MAP" : "D5 STAGE FOOD COURT MAP"}
            </h4>
            
            {/* Status Legend */}
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase">
              <span className="flex items-center gap-1 text-zinc-600">
                <span className="w-2.5 h-2.5 rounded bg-zinc-200 border border-zinc-400" /> Available
              </span>
              <span className="flex items-center gap-1 text-brand-violet">
                <span className="w-2.5 h-2.5 rounded bg-brand-violet" /> Allocated
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Paid
              </span>
            </div>
          </div>

          <div
            className={`grid gap-2.5 ${
              activeTab === "main" ? "grid-cols-5 sm:grid-cols-10" : "grid-cols-2 sm:grid-cols-5"
            }`}
          >
            {currentList.map((stall) => {
              const isSelected = selectedStall?.id === stall.id;

              return (
                <button
                  key={stall.id}
                  onClick={() => setSelectedStall(stall)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center font-mono ${
                    isSelected ? "ring-2 ring-brand-ink scale-105" : ""
                  } ${
                    stall.status === "paid"
                      ? "bg-emerald-500 text-white border-emerald-600"
                      : stall.status === "allocated"
                      ? "bg-brand-violet text-white border-brand-violet-dark"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                  }`}
                >
                  <span className="text-xs font-black">{stall.number}</span>
                  <span className="text-[9px] uppercase font-bold mt-0.5 opacity-80">
                    {stall.status === "paid" ? "PAID" : stall.status === "allocated" ? "HOLD" : "OPEN"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Stall Inspector */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-violet">
                STALL INSPECTOR
              </span>
              {selectedStall && (
                <span className="font-mono text-sm font-black text-brand-ink">{selectedStall.number}</span>
              )}
            </div>

            {selectedStall ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-zinc-400 font-bold uppercase text-[10px]">CURRENT STATUS</div>
                  <div className="font-display text-xl font-bold uppercase text-brand-ink mt-0.5">
                    {selectedStall.status.toUpperCase()}
                  </div>
                </div>

                <div>
                  <div className="text-zinc-400 font-bold uppercase text-[10px] mb-1">BUSINESS / MERCHANT NAME</div>
                  <input
                    type="text"
                    value={selectedStall.businessName || ""}
                    onChange={(e) => updateMerchantName(selectedStall.id, e.target.value)}
                    placeholder="e.g. Student Venture / Brand"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 font-bold text-xs text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-violet"
                  />
                </div>

                {selectedStall.contact && (
                  <div>
                    <div className="text-zinc-400 font-bold uppercase text-[10px]">CONTACT PERSON</div>
                    <div className="font-medium text-zinc-700">{selectedStall.contact}</div>
                    <div className="font-mono text-zinc-500">{selectedStall.phone}</div>
                  </div>
                )}

                <div>
                  <div className="text-zinc-400 font-bold uppercase text-[10px]">FIXED TARIFF</div>
                  <div className="font-mono font-bold text-sm text-brand-violet">₹4,000 / FESTIVAL</div>
                </div>

                {/* 3 Dedicated Action Buttons */}
                <div className="space-y-2 pt-3 border-t border-zinc-200">
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    SET STALL STATUS:
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {/* 1. Open / Available Button */}
                    <button
                      type="button"
                      onClick={() => setStatus(selectedStall.id, "available")}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between border transition-all ${
                        selectedStall.status === "available"
                          ? "bg-zinc-200 text-zinc-900 border-zinc-400 ring-2 ring-zinc-400"
                          : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                      }`}
                    >
                      <span>1. AVAILABLE (OPEN)</span>
                      {selectedStall.status === "available" && <CheckCircle2 className="w-4 h-4 text-zinc-700" />}
                    </button>

                    {/* 2. Allocate / Hold Button */}
                    <button
                      type="button"
                      onClick={() => setStatus(selectedStall.id, "allocated")}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between border transition-all ${
                        selectedStall.status === "allocated"
                          ? "bg-brand-violet text-white border-brand-violet-dark ring-2 ring-brand-violet/30 shadow-md"
                          : "bg-purple-50 hover:bg-purple-100 text-brand-violet border-purple-200"
                      }`}
                    >
                      <span>2. ALLOCATE / HOLD</span>
                      {selectedStall.status === "allocated" && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>

                    {/* 3. Paid & Confirmed Button */}
                    <button
                      type="button"
                      onClick={() => setStatus(selectedStall.id, "paid")}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between border transition-all ${
                        selectedStall.status === "paid"
                          ? "bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400 shadow-md"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      <span>3. CONFIRM & PAID</span>
                      {selectedStall.status === "paid" && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-zinc-400 font-semibold text-xs uppercase">
                Select any stall from the grid to inspect or update reservation status
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
