"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Home,
  User,
  AlertCircle,
  X,
  Wrench,
  Building2,
  MapPin,
  Grid,
  ListTodo,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addUnitAction } from "@/lib/actions";
import { useUser } from "@/context/UserContext";

export default function ResidenceClient({ initialUnits = [] }: { initialUnits: any[] }) {
  const { selectedResidenceId, residences } = useUser();
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUnit, setNewUnit] = useState({
    id: "",
    type: "T2",
    floor: "RDC",
    building: "A",
    rent: "650000",
    charges: "25000",
    surface: "65",
    rooms: "2",
    status: "Libre",
    furnished: false,
    description: "",
    residenceId: selectedResidenceId !== "ALL" ? selectedResidenceId : (residences[0]?.id || "RES-01"),
  });

  // Filter units based on selected residence, search query, and status
  const filteredUnits = initialUnits.filter((unit) => {
    // Residence filter
    if (selectedResidenceId && selectedResidenceId !== "ALL") {
      if (unit.residenceId && unit.residenceId !== selectedResidenceId) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "Libre" && unit.status !== "Libre" && unit.status !== "AVAILABLE") return false;
      if (
        statusFilter === "Occupé" &&
        unit.status !== "Occupé" &&
        unit.status !== "Occupéé" &&
        unit.status !== "OCCUPIED"
      ) {
        return false;
      }
      if (statusFilter === "Travaux" && unit.status !== "En travaux" && unit.status !== "MAINTENANCE") {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = unit.name?.toLowerCase().includes(q);
      const matchType = unit.type?.toLowerCase().includes(q);
      return matchName || matchType;
    }

    return true;
  });

  const handleAddUnit = async () => {
    if (!newUnit.id || !newUnit.rent) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", newUnit.id);
      formData.append("unitNumber", newUnit.id);
      formData.append("type", newUnit.type);
      formData.append("floor", newUnit.floor);
      formData.append("surface", newUnit.surface);
      formData.append("rent", newUnit.rent);
      formData.append("residenceId", newUnit.residenceId || selectedResidenceId || "RES-01");

      await addUnitAction(formData);

      setShowAddUnitModal(false);
      setNewUnit({
        id: "",
        type: "T2",
        floor: "RDC",
        building: "A",
        rent: "650000",
        charges: "25000",
        surface: "65",
        rooms: "2",
        status: "Libre",
        furnished: false,
        description: "",
        residenceId: selectedResidenceId !== "ALL" ? selectedResidenceId : (residences[0]?.id || "RES-01"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Occupé":
      case "Occupéé":
      case "OCCUPIED":
        return <User className="h-3.5 w-3.5 text-blue-500" />;
      case "Libre":
      case "AVAILABLE":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case "En travaux":
      case "MAINTENANCE":
        return <Wrench className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5 text-neutral-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Occupé" || status === "Occupéé" || status === "OCCUPIED") {
      return (
        <span className="text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 font-semibold">
          Occupé
        </span>
      );
    }
    if (status === "Libre" || status === "AVAILABLE") {
      return (
        <span className="text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold">
          Libre
        </span>
      );
    }
    return (
      <span className="text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 font-semibold">
        {status}
      </span>
    );
  };

  const selectedResidenceName =
    selectedResidenceId === "ALL"
      ? "Toutes les propriétés"
      : residences.find((r) => r.id === selectedResidenceId)?.name || "Propriété sélectionnée";

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
            Gestion des Logements & Lots
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-500" />
            Propriété active : <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedResidenceName}</span>
          </p>
        </div>

        <button
          onClick={() => {
            setNewUnit((prev) => ({
              ...prev,
              residenceId: selectedResidenceId !== "ALL" ? selectedResidenceId : (residences[0]?.id || "RES-01"),
            }));
            setShowAddUnitModal(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un logement</span>
        </button>
      </header>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-indigo-600 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {["all", "Libre", "Occupé", "Travaux"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
              }`}
            >
              {st === "all" ? "Tous les statuts" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of units */}
      {filteredUnits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUnits.map((unit) => {
            const unitRes = residences.find((r) => r.id === unit.residenceId);

            return (
              <div
                key={unit.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-lg font-bold text-neutral-900 dark:text-neutral-50 truncate pr-2"
                      title={unit.name}
                    >
                      {unit.name}
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs">
                      {getStatusIcon(unit.status)}
                      {getStatusBadge(unit.status)}
                    </div>
                  </div>

                  {unitRes && (
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mb-3 truncate flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {unitRes.name}
                    </p>
                  )}

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Type</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{unit.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Étage</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{unit.floor || "RDC"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Loyer mensuel</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {Number(unit.rent || 0).toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/residence/${unit.id}`}
                  className="block w-full py-2.5 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors border border-transparent hover:border-indigo-200"
                >
                  Gérer le logement & bail
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Aucun logement trouvé</h3>
          <p className="text-sm text-slate-500 mt-1">
            Aucun lot ne correspond aux critères ou à la propriété sélectionnée.
          </p>
        </div>
      )}

      {/* Modal: Add Unit */}
      <AnimatePresence>
        {showAddUnitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh] border border-neutral-200 dark:border-neutral-800"
            >
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Nouveau logement</h2>
                    <p className="text-xs text-neutral-500">Ajouter une unité à la résidence</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddUnitModal(false)}
                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Propriété de rattachement *
                  </label>
                  <select
                    value={newUnit.residenceId}
                    onChange={(e) => setNewUnit({ ...newUnit, residenceId: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                  >
                    {residences.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nom / Numéro *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Appartement B3"
                      value={newUnit.id}
                      onChange={(e) => setNewUnit({ ...newUnit, id: e.target.value })}
                      className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Type de bien
                    </label>
                    <select
                      value={newUnit.type}
                      onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    >
                      <option value="Chambre">Chambre</option>
                      <option value="Studio">Studio</option>
                      <option value="T1">T1</option>
                      <option value="T2">T2</option>
                      <option value="T3">T3</option>
                      <option value="Villa Duplex">Villa Duplex</option>
                      <option value="Local commercial">Local commercial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Loyer mensuel (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={newUnit.rent}
                      onChange={(e) => setNewUnit({ ...newUnit, rent: e.target.value })}
                      className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Étage / Niveau
                    </label>
                    <input
                      type="text"
                      value={newUnit.floor}
                      onChange={(e) => setNewUnit({ ...newUnit, floor: e.target.value })}
                      className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Surface (m²)
                    </label>
                    <input
                      type="number"
                      value={newUnit.surface}
                      onChange={(e) => setNewUnit({ ...newUnit, surface: e.target.value })}
                      className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Charges (FCFA)
                    </label>
                    <input
                      type="number"
                      value={newUnit.charges}
                      onChange={(e) => setNewUnit({ ...newUnit, charges: e.target.value })}
                      className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddUnit}
                  disabled={!newUnit.id || !newUnit.rent || isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/20 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
