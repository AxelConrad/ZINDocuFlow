import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GitBranchPlus, X, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewVersionConfirmModal({ document, isOpen, onClose, onConfirm }) {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <GitBranchPlus className="w-5 h-5 text-blue-600" />
            Neue Version erstellen
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <Alert>
            <GitBranchPlus className="h-4 w-4" />
            <AlertDescription>
              Sie sind dabei, eine neue Version für das folgende Dokument zu erstellen:
            </AlertDescription>
          </Alert>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="font-semibold text-slate-900">{document.name}</div>
            <div className="text-sm text-slate-600 mt-1">
              {document.hersteller} • {document.produkt}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              Aktuelle Version: {document.version_number}
            </div>
          </div>

          <p className="text-sm text-slate-600">
            Die neue Version wird automatisch als Version {document.version_number + 1} gespeichert.
            Sie werden zur Upload-Seite weitergeleitet, wo Sie die neue Datei hochladen können.
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
              onConfirm(document);
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Weiter zum Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}