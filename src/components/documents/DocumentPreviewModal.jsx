
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Download, ExternalLink, FileText, Calendar, Building2, Package, Hash } from "lucide-react";

const documentTypeColors = {
  "Handbuch": "bg-blue-100 text-blue-800 border-blue-200",
  "Datenblatt": "bg-green-100 text-green-800 border-green-200", 
  "Zertifikat": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Spezifikation": "bg-purple-100 text-purple-800 border-purple-200",
  "Anleitung": "bg-orange-100 text-orange-800 border-orange-200",
  "Sonstiges": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function DocumentPreviewModal({ document, isOpen, onClose }) {
  if (!document) return null;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    window.open(document.file_url, '_blank');
  };

  const handleOpenInNewTab = () => {
    window.open(document.file_url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            {document.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Document Info Card */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <Badge className={`${documentTypeColors[document.dokumentart]} border text-sm px-3 py-1`}>
                {document.dokumentart}
              </Badge>
              {document.version_number > 1 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Version {document.version_number}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Hersteller</p>
                  <p className="text-slate-900">{document.hersteller}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Produkt</p>
                  <p className="text-slate-900">{document.produkt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Datum</p>
                  <p className="text-slate-900">
                    {format(new Date(document.datum), "dd.MM.yyyy", { locale: de })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Dateigröße</p>
                  <p className="text-slate-900">{formatFileSize(document.file_size)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* File Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Datei-Informationen</h3>
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-700">Dateiname:</span>
                <span className="text-sm text-slate-900">{document.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-700">Erstellt am:</span>
                <span className="text-sm text-slate-900">
                  {format(new Date(document.created_date), "dd.MM.yyyy HH:mm", { locale: de })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-700">Zuletzt bearbeitet:</span>
                <span className="text-sm text-slate-900">
                  {format(new Date(document.updated_date), "dd.MM.yyyy HH:mm", { locale: de })}
                </span>
              </div>
            </div>
          </div>

          {/* File Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Dokument-Details</h3>
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                Klicken Sie auf "In neuem Tab öffnen" um das Dokument anzuzeigen
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleOpenInNewTab}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  In neuem Tab öffnen
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
