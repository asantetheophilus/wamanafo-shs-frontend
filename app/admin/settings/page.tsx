// ============================================================
// Wamanafo SHS — Admin School Settings Page
// Logo upload + school info editing
// ============================================================
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getToken, API_BASE } from "@/lib/api-client";
import {
  GraduationCap, Upload, CheckCircle2, AlertCircle,
  Loader2, Camera, Building2, Phone, Mail, BookOpen,
} from "lucide-react";

interface SchoolSettings {
  id:           string;
  name:         string;
  logoUrl:      string | null;
  motto:        string | null;
  address:      string | null;
  contactPhone: string | null;
  contactEmail: string | null;
}

function useSchoolSettings() {
  return useQuery({
    queryKey: ["school-settings"],
    queryFn:  async () => {
      const res = await api.get<SchoolSettings>("/api/v1/school-settings");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export default function SchoolSettingsPage() {
  const qc  = useQueryClient();
  const { data, isLoading } = useSchoolSettings();

  const [form, setForm] = useState({
    name: "", motto: "", address: "", contactPhone: "", contactEmail: "",
  });
  const [logoPreview,  setLogoPreview]  = useState<string | null>(null);
  const [logoFile,     setLogoFile]     = useState<File | null>(null);
  const [savingInfo,   setSavingInfo]   = useState(false);
  const [savingLogo,   setSavingLogo]   = useState(false);
  const [infoMsg,      setInfoMsg]      = useState<{ ok: boolean; text: string } | null>(null);
  const [logoMsg,      setLogoMsg]      = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) {
      setForm({
        name:         data.name         ?? "",
        motto:        data.motto        ?? "",
        address:      data.address      ?? "",
        contactPhone: data.contactPhone ?? "",
        contactEmail: data.contactEmail ?? "",
      });
    }
  }, [data]);

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Client-side validation
    const allowed = ["image/png","image/jpeg","image/jpg","image/svg+xml","image/webp"];
    if (!allowed.includes(file.type)) {
      setLogoMsg({ ok: false, text: "Only PNG, JPG, SVG, or WebP images are allowed." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoMsg({ ok: false, text: "Image must be smaller than 5 MB." });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoMsg(null);
  }

  async function uploadLogo() {
    if (!logoFile) return;
    setSavingLogo(true);
    setLogoMsg(null);
    const fd = new FormData();
    fd.append("logo", logoFile);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/v1/school-settings/logo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Upload failed.");
      setLogoMsg({ ok: true, text: "Logo updated successfully!" });
      qc.invalidateQueries({ queryKey: ["school-settings"] });
      setLogoFile(null);
    } catch (err: unknown) {
      setLogoMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setSavingLogo(false);
    }
  }

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);
    const res = await api.patch("/api/v1/school-settings", form);
    setSavingInfo(false);
    if (!res.success) { setInfoMsg({ ok: false, text: res.error }); return; }
    setInfoMsg({ ok: true, text: "School information saved." });
    qc.invalidateQueries({ queryKey: ["school-settings"] });
  }

  if (isLoading) return (
    <div className="page-shell">
      <div className="skeleton h-64 w-full" />
    </div>
  );

  const currentLogo = logoPreview ?? data?.logoUrl ?? null;

  return (
    <div className="page-shell">
      <div className="page-header mb-6">
        <div>
          <h1 className="page-title">School Settings</h1>
          <p className="page-subtitle">Manage your school profile, logo, and contact information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Logo Upload ──────────────────────────────── */}
        <div className="card p-6 lg:col-span-1">
          <h2 className="section-title flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-600" />
            School Logo
          </h2>

          {/* Preview */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50
                         flex items-center justify-center overflow-hidden cursor-pointer
                         hover:border-teal-400 transition-colors group relative"
              onClick={() => fileRef.current?.click()}
            >
              {currentLogo ? (
                <Image src={currentLogo} alt="School logo" fill className="object-contain p-2" />
              ) : (
                <div className="text-center">
                  <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">No logo</p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity
                              flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp"
              onChange={handleLogoSelect}
              className="hidden"
            />

            <button
              onClick={() => fileRef.current?.click()}
              className="btn-secondary btn-sm w-full"
            >
              <Upload className="w-3.5 h-3.5" />
              Choose Image
            </button>

            {logoFile && (
              <button
                onClick={uploadLogo}
                disabled={savingLogo}
                className="btn-primary btn-sm w-full"
              >
                {savingLogo
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading…</>
                  : <><CheckCircle2 className="w-3.5 h-3.5" />Save Logo</>
                }
              </button>
            )}

            {logoMsg && (
              <div className={logoMsg.ok ? "alert-success w-full text-xs rounded-lg px-3 py-2 flex items-center gap-2"
                                         : "alert-error w-full text-xs rounded-lg px-3 py-2 flex items-center gap-2"}>
                {logoMsg.ok
                  ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  : <AlertCircle  className="w-3.5 h-3.5 shrink-0" />
                }
                {logoMsg.text}
              </div>
            )}

            <p className="text-xs text-slate-400 text-center">
              PNG, JPG, SVG or WebP · Max 5 MB<br />
              Recommended: 200×200px
            </p>
          </div>
        </div>

        {/* ── School Info ──────────────────────────────── */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="section-title flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            School Information
          </h2>

          {infoMsg && (
            <div className={`mb-5 ${infoMsg.ok ? "alert-success" : "alert-error"}`}>
              {infoMsg.ok
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : <AlertCircle  className="w-4 h-4 shrink-0" />
              }
              <span>{infoMsg.text}</span>
            </div>
          )}

          <form onSubmit={saveInfo} className="space-y-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                School Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Wamanafo Senior High Technical School"
                className="input"
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                School Motto
              </label>
              <input
                type="text"
                value={form.motto}
                onChange={(e) => setForm((f) => ({ ...f, motto: e.target.value }))}
                placeholder="e.g. Excellence Through Knowledge"
                className="input"
              />
            </div>

            <div>
              <label className="label">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="PO Box 7, Wamanafo, Dormaa East, Ghana"
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="+233 24 000 0000"
                  className="input"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Contact Email
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  placeholder="info@wamanafo.edu.gh"
                  className="input"
                />
              </div>
            </div>

            <button type="submit" disabled={savingInfo} className="btn-primary">
              {savingInfo
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                : "Save Changes"
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
