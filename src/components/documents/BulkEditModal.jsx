import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Edit } from "lucide-react";

const DOCUMENT_TYPES = [
  "Handbuch",
  "Datenblatt", 
  "Zertifikat",
  "Spezifikation",
  "Anleitung",
  "Sonstiges"
];

export default function BulkEditModal({ documents, isOpen, onClose, onUpdate }) {
  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    name: false,
    hersteller: false,
    produkt: false,
    dokumentart: false,
    datum: false
  });

  const [formData, setFormData] = useState({
    name: "",
    hersteller: "",
    produkt: "",
    dokumentart: "",
    datum: ""
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleFieldToggle = (field, checked) => {
    setFieldsToUpdate(prev => ({
      ...prev,
      [field]: checked
    }));
    
    if (!checked) {
      setFormData(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Nur die ausgewählten Felder für das Update verwenden
    const updateData = {};
    Object.keys(fieldsToUpdate).forEach(field => {
      if (fieldsToUpdate[field] && formData[field]) {
        updateData[field] = formData[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(updateData);
      
      // Reset form
      setFieldsToUpdate({
        name: false,
        hersteller: false,
        produkt: false,
        dokumentart: false,
        datum: false
      });
      setFormData({
        name: "",
        hersteller: "",
        produkt: "",
        dokumentart: "",
        datum: ""
      });
    } catch (error) {
      console.error("Error bulk updating documents:", error);
    }
    setIsUpdating(false);
  };

  const hasSelectedFields = Object.values(fieldsToUpdate).some(Boolean);
  const hasValidData = Object.keys(fieldsToUpdate).some(field => 
    fieldsToUpdate[field] && formData[field]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Mehrere Dokumente bearbeiten
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            {documents?.length} Dokumente werden bearbeitet. Wählen Sie die Felder aus, die Sie ändern möchten.
          </p>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="bulk-name"
                checked={fieldsToUpdate.name}
                onCheckedChange={(checked) => handleFieldToggle("name", checked)}
              />
              <Label htmlFor="bulk-name" className="text-sm font-medium">Name ändern</Label>
            </div>
            {fieldsToUpdate.name && (
              <Input
                placeholder="Neuer Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="ml-6"
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="bulk-hersteller"
                checked={fieldsToUpdate.hersteller}
                onCheckedChange={(checked) => handleFieldToggle("hersteller", checked)}
              />
              <Label htmlFor="bulk-hersteller" className="text-sm font-medium">Hersteller ändern</Label>
            </div>
            {fieldsToUpdate.hersteller && (
              <Input
                placeholder="Neuer Hersteller"
                value={formData.hersteller}
                onChange={(e) => handleChange("hersteller", e.target.value)}
                className="ml-6"
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="bulk-produkt"
                checked={fieldsToUpdate.produkt}
                onCheckedChange={(checked) => handleFieldToggle("produkt", checked)}
              />
              <Label htmlFor="bulk-produkt" className="text-sm font-medium">Produkt ändern</Label>
            </div>
            {fieldsToUpdate.produkt && (
              <Input
                placeholder="Neues Produkt"
                value={formData.produkt}
                onChange={(e) => handleChange("produkt", e.target.value)}
                className="ml-6"
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="bulk-dokumentart"
                checked={fieldsToUpdate.dokumentart}
                onCheckedChange={(checked) => handleFieldToggle("dokumentart", checked)}
              />
              <Label htmlFor="bulk-dokumentart" className="text-sm font-medium">Dokumentart ändern</Label>
            </div>
            {fieldsToUpdate.dokumentart && (
              <Select 
                value={formData.dokumentart} 
                onValueChange={(value) => handleChange("dokumentart", value)}
              >
                <SelectTrigger className="ml-6">
                  <SelectValue placeholder="Neue Dokumentart" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="bulk-datum"
                checked={fieldsToUpdate.datum}
                onCheckedChange={(checked) => handleFieldToggle("datum", checked)}
              />
              <Label htmlFor="bulk-datum" className="text-sm font-medium">Datum ändern</Label>
            </div>
            {fieldsToUpdate.datum && (
              <Input
                type="date"
                value={formData.datum}
                onChange={(e) => handleChange("datum", e.target.value)}
                className="ml-6"
              />
            )}
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
            disabled={isUpdating || !hasValidData}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isUpdating ? "Speichern..." : "Alle speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}