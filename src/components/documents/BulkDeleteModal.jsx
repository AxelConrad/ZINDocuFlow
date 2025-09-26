import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BulkDeleteModal({ documents, isOpen, onClose, onConfirm, isDeleting }) {
  if (!documents || documents.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Dokumente löschen
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
              Sie sind dabei, <strong>{documents.length}</strong> Dokumente dauerhaft zu löschen:
            </p>
            <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="text-sm">
                    <div className="font-medium text-slate-900">{doc.name}</div>
                    <div className="text-slate-600">
                      {doc.hersteller} • {doc.produkt} • Version {doc.version_number}
                    </div>
                  </div>
                ))}
                {documents.length > 5 && (
                  <div className="text-sm text-slate-500 mt-2">
                    ... und {documents.length - 5} weitere Dokumente
                  </div>
                )}
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
            {isDeleting ? "Wird gelöscht..." : `${documents.length} Dokumente löschen`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}