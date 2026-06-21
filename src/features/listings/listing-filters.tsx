"use client";

import { parseAsBoolean, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { SORT_OPTIONS } from "@/lib/constants";
import { CITIES, districtsFor } from "@/lib/data/locations";

export function ListingFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      city: parseAsString,
      district: parseAsString,
      minRent: parseAsInteger,
      maxRent: parseAsInteger,
      minAvailable: parseAsInteger,
      pets: parseAsBoolean,
      sort: parseAsString,
    },
    { shallow: false, history: "push" },
  );

  const [minRent, setMinRent] = useState(filters.minRent?.toString() ?? "");
  const [maxRent, setMaxRent] = useState(filters.maxRent?.toString() ?? "");

  const districts = filters.city ? districtsFor(filters.city) : [];
  const hasActive =
    filters.city ||
    filters.district ||
    filters.minRent ||
    filters.maxRent ||
    filters.minAvailable ||
    filters.pets;

  function applyRent() {
    setFilters({
      minRent: minRent ? Number(minRent) : null,
      maxRent: maxRent ? Number(maxRent) : null,
    });
  }

  function clearAll() {
    setMinRent("");
    setMaxRent("");
    setFilters({
      city: null,
      district: null,
      minRent: null,
      maxRent: null,
      minAvailable: null,
      pets: null,
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="size-4 text-primary" /> Filtreler
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Sırala</Label>
          <NativeSelect
            className="w-44"
            value={filters.sort ?? "recommended"}
            onChange={(e) => setFilters({ sort: e.target.value })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-1.5">
          <Label>Şehir</Label>
          <NativeSelect
            value={filters.city ?? ""}
            onChange={(e) => setFilters({ city: e.target.value || null, district: null })}
          >
            <option value="">Tümü</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <Label>İlçe</Label>
          <NativeSelect
            value={filters.district ?? ""}
            disabled={!filters.city}
            onChange={(e) => setFilters({ district: e.target.value || null })}
          >
            <option value="">Tümü</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minRent">Min. kira</Label>
          <Input
            id="minRent"
            inputMode="numeric"
            placeholder="₺"
            value={minRent}
            onChange={(e) => setMinRent(e.target.value.replace(/\D/g, ""))}
            onBlur={applyRent}
            onKeyDown={(e) => e.key === "Enter" && applyRent()}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maxRent">Maks. kira</Label>
          <Input
            id="maxRent"
            inputMode="numeric"
            placeholder="₺"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value.replace(/\D/g, ""))}
            onBlur={applyRent}
            onKeyDown={(e) => e.key === "Enter" && applyRent()}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Müsait kişi</Label>
          <NativeSelect
            value={filters.minAvailable?.toString() ?? ""}
            onChange={(e) =>
              setFilters({ minAvailable: e.target.value ? Number(e.target.value) : null })
            }
          >
            <option value="">Farketmez</option>
            <option value="1">1+ kişi</option>
            <option value="2">2+ kişi</option>
            <option value="3">3+ kişi</option>
          </NativeSelect>
        </div>

        <div className="flex items-end">
          <label className="flex h-9 cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={!!filters.pets}
              onChange={(e) => setFilters({ pets: e.target.checked ? true : null })}
            />
            Evcil hayvan
          </label>
        </div>
      </div>

      {hasActive && (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X /> Filtreleri temizle
          </Button>
        </div>
      )}
    </div>
  );
}
