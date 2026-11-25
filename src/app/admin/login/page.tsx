"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/admin/login";
import { AlertCircle, Loader2, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 px-4 py-1 rounded-xl bg-white/10 border border-white/20 flex items-center">
              <span className="font-extrabold text-lg text-white tracking-tight">ATHLORA</span>
            </div>
          </div>
          <h1 className="text-xl font-extrabold text-white">Espace Admin</h1>
          <p className="text-sm text-white/50 mt-1">Connexion requise</p>
        </div>

        <form action={action} className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
          {state?.error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <p className="text-sm text-red-700">Identifiants incorrects</p>
            </div>
          )}

          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] block mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              name="mdp"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Connexion…</>
            ) : (
              <><Lock size={16} /> Se connecter</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
