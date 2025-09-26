import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DeleteConfirmModal({ document, isOpen, onClose, onConfirm, isDeleting }) {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Dokument löschen
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Achtung:</strong> Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-2">
            <p className="text-slate-700">
              Sie sind dabei, das folgende Dokument dauerhaft zu löschen:
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="font-semibold text-slate-900">{document.name}</div>
              <div className="text-sm text-slate-600 mt-1">
                {document.hersteller} • {document.produkt} • Version {document.version_number}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Wird gelöscht..." : "Endgültig löschen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}