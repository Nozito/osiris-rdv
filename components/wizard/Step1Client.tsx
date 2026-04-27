"use client";

import { useRef, useState } from "react";
import { User, Mail, Building2, Phone, Search, X, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader } from "@/components/ui/Card";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { useWizard } from "./WizardShell";
import type { Client } from "@/types";

export function Step1Client() {
  const { data, update } = useWizard();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const supabase = createSupabaseClient();

  const doSearch = async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    const { data: rows } = await supabase
      .from("clients")
      .select("*")
      .or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`)
      .order("name")
      .limit(6);
    setResults(rows ?? []);
    setOpen(true);
    setSearching(false);
  };

  const handleSearchInput = (val: string) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 280);
  };

  const selectClient = (client: Client) => {
    update({
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientCompany: client.company,
      clientPhone: client.phone,
    });
    setSearch("");
    setResults([]);
    setOpen(false);
  };

  const clearClient = () => {
    update({
      clientId: null,
      clientName: "",
      clientEmail: "",
      clientCompany: "",
      clientPhone: "",
    });
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      {/* Recherche client existant */}
      <Card>
        <CardHeader
          title="Client existant"
          description="Recherchez parmi vos clients pour pré-remplir le formulaire"
          icon={<Search size={18} />}
        />

        <div className="relative">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => search.length >= 2 && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Nom, email ou entreprise…"
              className="w-full h-11 rounded-[10px] bg-surface2 border border-white/8 pl-10 pr-4 text-sm text-textc placeholder:text-faint focus:border-accent focus:outline-none transition-colors"
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-faint text-xs animate-pulse">
                …
              </span>
            )}
          </div>

          <AnimatePresence>
            {open && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-card bg-surface border border-white/12 shadow-2xl overflow-hidden"
              >
                {results.map((client) => (
                  <button
                    key={client.id}
                    onMouseDown={() => selectClient(client)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface2 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                      {initials(client.name || client.email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-textc truncate">
                        {client.name || "—"}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {[client.company, client.email]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <UserCheck size={14} className="text-accent shrink-0" />
                  </button>
                ))}
              </motion.div>
            )}

            {open && !searching && results.length === 0 && search.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-card bg-surface border border-white/12 px-4 py-3"
              >
                <p className="text-xs text-muted">
                  Aucun client trouvé — remplissez les champs ci-dessous pour en créer un nouveau.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Client lié */}
        <AnimatePresence>
          {data.clientId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-accent/8 border border-accent/20">
                <UserCheck size={14} className="text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-accent">
                    Client lié :
                  </span>{" "}
                  <span className="text-xs text-textc">
                    {data.clientName}
                    {data.clientCompany ? ` — ${data.clientCompany}` : ""}
                  </span>
                </div>
                <button
                  onClick={clearClient}
                  className="text-faint hover:text-textc transition-colors"
                  title="Délier le client"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Formulaire client */}
      <Card>
        <CardHeader
          title={data.clientId ? "Informations client" : "Nouveau client"}
          description={
            data.clientId
              ? "Modifiez si besoin — les changements seront répercutés sur le client"
              : "Ces informations créeront un nouveau client dans votre base"
          }
          icon={<User size={18} />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nom complet"
            placeholder="Jean Dupont"
            value={data.clientName}
            onChange={(e) => update({ clientName: e.target.value })}
            icon={<User size={15} />}
            autoFocus={!data.clientId}
          />
          <Input
            label="Email"
            type="email"
            placeholder="jean@entreprise.fr"
            value={data.clientEmail}
            onChange={(e) => update({ clientEmail: e.target.value })}
            icon={<Mail size={15} />}
          />
          <Input
            label="Entreprise"
            placeholder="Acme Corp"
            value={data.clientCompany}
            onChange={(e) => update({ clientCompany: e.target.value })}
            icon={<Building2 size={15} />}
          />
          <Input
            label="Téléphone"
            type="tel"
            placeholder="+33 6 00 00 00 00"
            value={data.clientPhone}
            onChange={(e) => update({ clientPhone: e.target.value })}
            icon={<Phone size={15} />}
          />
        </div>
      </Card>
    </div>
  );
}
