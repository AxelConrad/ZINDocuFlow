import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function DocumentFilters({ 
  filters, 
  setFilters, 
  availableTypes, 
  availableManufacturers,
  availableGehoertZu
}) {
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <Select 
          value={filters.dokumentart} 
          onValueChange={(value) => handleFilterChange("dokumentart", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Dokumentart" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Arten</SelectItem>
            {availableTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Select 
          value={filters.hersteller} 
          onValueChange={(value) => handleFilterChange("hersteller", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Hersteller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Hersteller</SelectItem>
            {availableManufacturers.map((manufacturer) => (
              <SelectItem key={manufacturer} value={manufacturer}>
                {manufacturer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Select 
          value={filters.gehoert_zu} 
          onValueChange={(value) => handleFilterChange("gehoert_zu", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Gehört zu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle 'Gehört zu'</SelectItem>
            {availableGehoertZu.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}