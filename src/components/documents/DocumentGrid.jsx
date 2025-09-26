
import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Download, Edit, Eye, Trash2, Calendar, Building2, Package, MoreHorizontal, History, GitBranchPlus } from "lucide-react";
import FileTypeIcon from './FileTypeIcon';

const documentTypeColors = {
  "Handbuch": "bg-blue-100 text-blue-800 border-blue-200",
  "Datenblatt": "bg-green-100 text-green-800 border-green-200", 
  "Zertifikat": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Spezifikation": "bg-purple-100 text-purple-800 border-purple-200",
  "Anleitung": "bg-orange-100 text-orange-800 border-orange-200",
  "Sonstiges": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function DocumentGrid({ documents, isLoading, onEditDocument, onDeleteDocument, onPreviewDocument, onShowVersionHistory, onNewVersion }) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (document) => {
    window.open(document.file_url, '_blank');
  };

  const truncateText = (text, maxLength = 24) => { // Changed maxLength from 30 to 24
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, index) => (
          <Card key={index} className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Keine Dokumente gefunden
        </h3>
        <p className="text-slate-600 mb-6">
          Laden Sie Ihr erstes Dokument hoch oder ändern Sie Ihre Suchkriterien.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((document) => (
        <Card key={document.id} className="hover:shadow-lg transition-all duration-200 border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div 
                className="flex-grow cursor-pointer group"
                onClick={() => onPreviewDocument(document)}
              >
                <div className="flex items-start gap-3">
                  <FileTypeIcon fileName={document.file_name} className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 
                      className="font-semibold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors"
                      title={document.name}
                    >
                      {truncateText(document.name)}
                    </h3>
                    <Badge className={`${documentTypeColors[document.dokumentart]} border w-fit mt-1`}>
                      {document.dokumentart}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 flex items-center gap-2">
                {document.version_number > 1 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    v{document.version_number}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-slate-200 h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => onPreviewDocument(document)}
                      className="cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDownload(document)}
                      className="cursor-pointer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onEditDocument(document)}
                      className="cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onNewVersion(document)}
                      className="cursor-pointer"
                    >
                      <GitBranchPlus className="w-4 h-4 mr-2" />
                      Neue Version
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onShowVersionHistory(document)}
                      className="cursor-pointer"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Versionsverlauf
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteDocument(document)}
                      className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Hersteller:</span>
                <span>{document.hersteller}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Package className="w-4 h-4" />
                <span className="font-medium">Produkt:</span>
                <span>{document.produkt}</span>
              </div>
              {document.gehoert_zu && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Gehört zu:</span>
                  <span>{document.gehoert_zu}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Datum:</span>
                <span>{format(new Date(document.datum), "dd.MM.yyyy", { locale: de })}</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>Datei: {document.file_name}</div>
              <div>Größe: {formatFileSize(document.file_size)}</div>
              <div>Erstellt: {format(new Date(document.created_date), "dd.MM.yyyy HH:mm", { locale: de })}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
