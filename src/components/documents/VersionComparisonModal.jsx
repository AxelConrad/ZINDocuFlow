import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { GitCompareArrows, X } from "lucide-react";

export default function VersionComparisonModal({ versionsToCompare, isOpen, onClose }) {
  if (!versionsToCompare || versionsToCompare.length !== 2) {
    return null;
  }

  // Sort versions to have a consistent order (older on left, newer on right)
  const [versionA, versionB] = versionsToCompare.sort((a, b) => a.version_number - b.version_number);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "dd.MM.yyyy", { locale: de });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: de });
  };

  const fieldsToCompare = [
    { label: "Name", key: "name", formatter: (val) => val },
    { label: "Hersteller", key: "hersteller", formatter: (val) => val },
    { label: "Produkt", key: "produkt", formatter: (val) => val },
    { label: "Dokumentart", key: "dokumentart", formatter: (val) => val },
    { label: "Datum", key: "datum", formatter: formatDate },
    { label: "Dateigröße", key: "file_size", formatter: formatFileSize },
    { label: "Erstellt am", key: "created_date", formatter: formatDateTime },
    { label: "Erstellt von", key: "created_by", formatter: (val) => val },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <GitCompareArrows className="w-6 h-6 text-blue-600" />
            Versionsvergleich
          </DialogTitle>
          <p className="text-slate-600">Vergleich von Version {versionA.version_number} und Version {versionB.version_number}</p>
        </DialogHeader>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-1/4 font-semibold">Feld</TableHead>
                <TableHead className="w-3/8">
                  <Badge variant="secondary">Version {versionA.version_number}</Badge>
                </TableHead>
                <TableHead className="w-3/8">
                  <Badge className="bg-blue-600 hover:bg-blue-700">Version {versionB.version_number}</Badge>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fieldsToCompare.map(({ label, key, formatter }) => {
                const valueA = formatter(versionA[key]);
                const valueB = formatter(versionB[key]);
                const isDifferent = valueA !== valueB;

                return (
                  <TableRow key={key} className={isDifferent ? "bg-yellow-50" : ""}>
                    <TableCell className="font-medium text-slate-700">{label}</TableCell>
                    <TableCell className={isDifferent ? "font-semibold text-yellow-900" : ""}>{valueA}</TableCell>
                    <TableCell className={isDifferent ? "font-semibold text-yellow-900" : ""}>{valueB}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="pt-6">
          <Button onClick={onClose} className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}