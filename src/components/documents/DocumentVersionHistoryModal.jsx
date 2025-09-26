
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Document } from "@/api/entities";
import { Download, Eye, Clock, FileText, User, Calendar, GitCompareArrows } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import VersionComparisonModal from "./VersionComparisonModal";

export default function DocumentVersionHistoryModal({ document, isOpen, onClose, onPreviewVersion }) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const loadVersionHistory = useCallback(async () => {
    if (!document) return;
    
    setIsLoading(true);
    try {
      const allVersions = await Document.filter({ file_name: document.file_name });
      const sortedVersions = allVersions.sort((a, b) => b.version_number - a.version_number);
      setVersions(sortedVersions);
    } catch (error) {
      console.error("Fehler beim Laden der Versionen:", error);
    }
    setIsLoading(false);
  }, [document]);

  useEffect(() => {
    if (isOpen && document) {
      loadVersionHistory();
      setSelectedForComparison([]); // Reset selection when modal opens
    }
  }, [isOpen, document, loadVersionHistory]);

  const handleComparisonSelect = (versionId) => {
    setSelectedForComparison((currentSelected) => {
      if (currentSelected.includes(versionId)) {
        return currentSelected.filter((id) => id !== versionId);
      }
      if (currentSelected.length < 2) {
        return [...currentSelected, versionId];
      }
      return currentSelected; // Limit to 2 selections
    });
  };
  
  const getVersionsToCompare = () => {
    return versions.filter(v => selectedForComparison.includes(v.id));
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (version) => {
    window.open(version.file_url, '_blank');
  };

  const isCurrentVersion = (version) => {
    return version.id === document.id;
  };

  if (!document) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              Versionsverlauf: {document.name}
            </DialogTitle>
            <div className="text-sm text-slate-600 mt-2">
              Datei: {document.file_name}
            </div>
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : versions.length > 0 ? (
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div 
                    key={version.id} 
                    className={`border rounded-lg p-4 transition-all ${
                      isCurrentVersion(version) 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Checkbox
                          id={`compare-${version.id}`}
                          checked={selectedForComparison.includes(version.id)}
                          onCheckedChange={() => handleComparisonSelect(version.id)}
                          disabled={selectedForComparison.length >= 2 && !selectedForComparison.includes(version.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge 
                              variant={isCurrentVersion(version) ? "default" : "secondary"}
                              className={`text-sm px-3 py-1 ${
                                isCurrentVersion(version) 
                                  ? 'bg-blue-600 hover:bg-blue-700' 
                                  : ''
                              }`}
                            >
                              Version {version.version_number}
                              {isCurrentVersion(version) && ' (Aktuell)'}
                            </Badge>
                            {index === 0 && !isCurrentVersion(version) && (
                              <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                                Neueste Version
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                               <User className="w-4 h-4 text-slate-500" />
                               <p><span className="font-medium text-slate-700">Erstellt von:</span> {version.created_by || 'Unbekannt'}</p>
                            </div>
                             <div className="flex items-center gap-2">
                               <Calendar className="w-4 h-4 text-slate-500" />
                               <p><span className="font-medium text-slate-700">Erstellt am:</span> {format(new Date(version.created_date), "dd.MM.yyyy HH:mm", { locale: de })}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 self-start md:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPreviewVersion && onPreviewVersion(version)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(version)}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Keine Versionen gefunden
                </h3>
                <p className="text-slate-600">
                  Für dieses Dokument konnten keine Versionen geladen werden.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-slate-600">
                {selectedForComparison.length}/2 Versionen zum Vergleich ausgewählt
              </span>
              <Button 
                onClick={() => setIsComparisonModalOpen(true)}
                disabled={selectedForComparison.length !== 2}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <GitCompareArrows className="w-4 h-4" />
                Vergleichen
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <VersionComparisonModal 
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        versionsToCompare={getVersionsToCompare()}
      />
    </>
  );
}
