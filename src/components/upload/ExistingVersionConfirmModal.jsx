import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GitBranchPlus, X, AlertTriangle } from "lucide-react";

export default function ExistingVersionConfirmModal({ isOpen, onClose, onConfirm, existingDocument, newFileName }) {
  if (!existingDocument) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Dokument bereits vorhanden
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <Alert variant="default" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Eine Datei mit dem Namen <strong>"{newFileName}"</strong> existiert bereits.
            </AlertDescription>
          </Alert>

          <p className="text-slate-700">
            Möchten Sie eine neue Version für das folgende, bereits existierende Dokument erstellen?
          </p>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="font-semibold text-slate-900">{existingDocument.name}</div>
            <div className="text-sm text-slate-600 mt-1">
              {existingDocument.hersteller} • {existingDocument.produkt}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Aktuelle Version: {existingDocument.version_number}
            </div>
          </div>
          
          <p className="text-sm text-slate-600">
            Wenn Sie bestätigen, werden die Metadaten des bestehenden Dokuments übernommen und eine neue Version {existingDocument.version_number + 1} wird angelegt.
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Abbrechen
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <GitBranchPlus className="w-4 h-4" />
            Neue Version erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}