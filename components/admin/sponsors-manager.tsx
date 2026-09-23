"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Award,
  Globe,
  X,
  Save,
} from "lucide-react";
import { SPONSORS_LIST } from "@/lib/mock-data";
import { getAuthHeaders } from "@/lib/auth-client";

interface Sponsor {
  id?: string;
  name: string;
  tier: string;
  category?: string;
  website_url?: string | null;
  logo_url?: string | null;
  sort_order?: number;
}

const TIER_PRESETS = [
  "Title Partner",
  "Powered By Partner",
  "Track Partner",
  "Hydration Partner",
  "Ecosystem Partner",
  "Incubation Partner",
  "Infrastructure Partner",
  "Broadcast Partner",
  "Goodies Partner",
];

export default function SponsorsManager() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    tier: string;
    category: string;
    website_url: string;
  }>({
    name: "",
    tier: "Track Partner",
    category: "Venture & Tech",
    website_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Delete modal state
  const [deletingSponsor, setDeletingSponsor] = useState<Sponsor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sponsors");
      const json = await res.json();
      if (json.sponsors && Array.isArray(json.sponsors)) {
        setSponsors(json.sponsors);
      } else {
        setSponsors([]);
      }
    } catch (e) {
      console.error("Failed to load sponsors", e);
      setSponsors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDefaults = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const authHeaders = await getAuthHeaders();
      for (const item of SPONSORS_LIST) {
        await fetch("/api/admin/sponsors", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(item),
        });
      }
      await fetchSponsors();
      setStatusMessage({
        type: "success",
        text: "Loaded default festival partners into database!",
      });
    } catch (e: any) {
      setStatusMessage({
        type: "error",
        text: e.message || "Failed to load defaults",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSponsor(null);
    setFormData({
      name: "",
      tier: "Track Partner",
      category: "Venture & Tech",
      website_url: "",
    });
    setIsModalOpen(true);
    setStatusMessage(null);
  };

  const handleOpenEditModal = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      id: sponsor.id,
      name: sponsor.name,
      tier: sponsor.tier,
      category: sponsor.category || "Ecosystem",
      website_url: sponsor.website_url || "",
    });
    setIsModalOpen(true);
    setStatusMessage(null);
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.tier.trim()) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const authHeaders = await getAuthHeaders();
      if (editingSponsor && editingSponsor.id) {
        // Update existing sponsor
        const res = await fetch("/api/admin/sponsors", {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            id: editingSponsor.id,
            ...formData,
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || "Failed to update sponsor");

        setStatusMessage({
          type: "success",
          text: `Updated partner "${formData.name}" successfully!`,
        });
        setSponsors((prev) =>
          prev.map((s) => (s.id === editingSponsor.id ? { ...s, ...formData } : s))
        );
      } else {
        // Create new sponsor
        const res = await fetch("/api/admin/sponsors", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || "Failed to add sponsor");

        const newSponsor = json.sponsor || { id: `temp-${Date.now()}`, ...formData };
        setStatusMessage({
          type: "success",
          text: `Added new partner "${formData.name}" to the festival!`,
        });
        setSponsors((prev) => [...prev, newSponsor]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "An error occurred while saving sponsor",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSponsor = async () => {
    if (!deletingSponsor) return;
    setIsDeleting(true);

    try {
      if (deletingSponsor.id) {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`/api/admin/sponsors?id=${deletingSponsor.id}`, {
          method: "DELETE",
          headers: { ...authHeaders },
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || "Failed to delete sponsor");
      }

      setSponsors((prev) => prev.filter((s) => s.id !== deletingSponsor.id && s.name !== deletingSponsor.name));
      setStatusMessage({
        type: "success",
        text: `Removed partner "${deletingSponsor.name}" from database.`,
      });
      setDeletingSponsor(null);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to delete sponsor",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/10 text-brand-violet text-[10px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PARTNER & SPONSOR MANAGEMENT</span>
          </div>
          <h2 className="font-display text-2xl font-bold uppercase text-brand-ink">
            FESTIVAL SPONSORS & BRAND TIERS
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Manage industry partners, sponsors, and tier badges displayed on the live landing page marquee ticker.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleLoadDefaults}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-brand-violet/30 hover:bg-brand-violet/10 text-brand-violet text-xs font-bold uppercase transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Festival Defaults</span>
          </button>

          <button
            onClick={fetchSponsors}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-brand-ink text-xs font-bold uppercase transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-violet text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Partner</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-[10px] uppercase font-black opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live Marquee Ticker Preview */}
      <div className="bg-brand-ink text-white p-6 rounded-3xl border border-zinc-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${sponsors.length > 0 ? "bg-brand-lime animate-pulse" : "bg-zinc-600"}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-lime">
              LIVE TICKER PREVIEW ({sponsors.length} PARTNERS)
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {sponsors.length > 0 ? "Streamed on Homepage" : "Ticker Hidden (No Sponsors)"}
          </span>
        </div>

        {sponsors.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar py-2">
            <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
              {sponsors.map((sponsor, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 border border-white/15"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
                  <span className="font-display text-lg font-black uppercase text-white">
                    {sponsor.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-violet text-white">
                    {sponsor.tier}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-zinc-400 font-semibold">
            No sponsors active in database. The ticker is currently hidden on the public site.
          </div>
        )}
      </div>

      {/* Sponsors Table / Card Grid */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold uppercase text-brand-ink">
            ALL ACTIVE PARTNERS & SPONSORS
          </h3>
          <span className="text-xs font-mono font-bold text-zinc-400">
            {sponsors.length} PARTNERS LOGGED
          </span>
        </div>

        {sponsors.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {sponsors.map((sponsor, idx) => (
              <div
                key={sponsor.id || idx}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-brand-violet/10 text-brand-violet flex items-center justify-center font-display font-black text-sm">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-black uppercase text-brand-ink leading-tight">
                        {sponsor.name}
                      </h4>
                      {sponsor.website_url && (
                        <a
                          href={sponsor.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-400 hover:text-brand-violet"
                          title={sponsor.website_url}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-violet text-white">
                        {sponsor.tier}
                      </span>
                      {sponsor.category && (
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">
                          · {sponsor.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEditModal(sponsor)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-brand-ink text-xs font-bold uppercase transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeletingSponsor(sponsor)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold uppercase transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" />
            </div>
            <h4 className="font-display text-xl font-bold uppercase text-brand-ink">
              NO SPONSORS IN DATABASE
            </h4>
            <p className="text-xs text-zinc-500 font-medium max-w-sm mx-auto">
              Your sponsors table in Supabase is currently empty. You can add individual partners or click below to populate the festival defaults.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleLoadDefaults}
                className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-violet-dark transition-colors shadow-sm"
              >
                Load Festival Defaults
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-brand-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-sm"
              >
                Add First Partner
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-violet text-white flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase text-brand-ink">
                  {editingSponsor ? "EDIT PARTNER" : "ADD NEW PARTNER"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSponsor} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  BRAND / COMPANY NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Ventures or Zephyr FinTech"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  PARTNER TIER BADGE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Track Partner or Title Partner"
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-violet mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {TIER_PRESETS.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setFormData({ ...formData, tier })}
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md transition-colors ${
                        formData.tier === tier
                          ? "bg-brand-violet text-white"
                          : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  INDUSTRY / CATEGORY (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Venture Capital, Web3, Cloud & AI, F&B"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand-ink mb-1">
                  WEBSITE URL (OPTIONAL)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-violet"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-xs font-bold uppercase text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-violet text-white text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : editingSponsor ? "Update Partner" : "Add Partner"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase text-brand-ink">
              REMOVE {deletingSponsor.name}?
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Are you sure you want to remove <strong>{deletingSponsor.name}</strong> from the festival sponsors list? It will immediately stop showing on the landing page marquee.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingSponsor(null)}
                className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-xs font-bold uppercase text-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSponsor}
                disabled={isDeleting}
                className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
