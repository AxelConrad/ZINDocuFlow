
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

const DOCUMENT_TYPES = [
  "Handbuch",
  "Datenblatt",
  "Zertifikat",
  "Spezifikation",
  "Anleitung",
  "Sonstiges"
];

export default function DocumentEditModal({ document, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    hersteller: "",
    produkt: "",
    gehoert_zu: "", // New field added
    dokumentart: "",
    datum: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (document) {
      setFormData({
        name: document.name || "",
        hersteller: document.hersteller || "",
        produkt: document.produkt || "",
        gehoert_zu: document.gehoert_zu || "", // New field added
        dokumentart: document.dokumentart || "",
        datum: document.datum || ""
      });
    }
  }, [document]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.hersteller || !formData.produkt || !formData.dokumentart || !formData.datum) {
      // 'gehoert_zu' is not marked as required, so it's not included in this validation check
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(formData);
    } catch (error) {
      console.error("Error updating document:", error);
    }
    setIsUpdating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Dokument bearbeiten
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-hersteller">Hersteller *</Label>
            <Input
              id="edit-hersteller"
              value={formData.hersteller}
              onChange={(e) => handleChange("hersteller", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-produkt">Produkt *</Label>
            <Input
              id="edit-produkt"
              value={formData.produkt}
              onChange={(e) => handleChange("produkt", e.target.value)}
              className="mt-1"
            />
          </div>

          {/* New field: Gehört zu */}
          <div>
            <Label htmlFor="edit-gehoert_zu">Gehört zu</Label>
            <Input
              id="edit-gehoert_zu"
              value={formData.gehoert_zu}
              onChange={(e) => handleChange("gehoert_zu", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="edit-dokumentart">Dokumentart *</Label>
            <Select
              value={formData.dokumentart}
              onValueChange={(value) => handleChange("dokumentart", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Dokumentart auswählen" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-datum">Datum *</Label>
            <Input
              id="edit-datum"
              type="date"
              value={formData.datum}
              onChange={(e) => handleChange("datum", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isUpdating ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
