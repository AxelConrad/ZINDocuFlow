
import React, { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Download, Edit, Eye, Trash2, ChevronDown, ChevronUp, ArrowUpDown, MoreHorizontal, History, GitBranchPlus } from "lucide-react";
import FileTypeIcon from "./FileTypeIcon";

const documentTypeColors = {
  "Handbuch": "bg-blue-100 text-blue-800 border-blue-200",
  "Datenblatt": "bg-green-100 text-green-800 border-green-200", 
  "Zertifikat": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Spezifikation": "bg-purple-100 text-purple-800 border-purple-200",
  "Anleitung": "bg-orange-100 text-orange-800 border-orange-200",
  "Sonstiges": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function DocumentTable({ 
  documents, 
  isLoading, 
  onEditDocument, 
  onDeleteDocument, 
  onPreviewDocument, 
  onShowVersionHistory,
  onNewVersion,
  selectedDocuments = [],
  onSelectDocument,
  onSelectAll,
  onBulkDelete,
  onBulkEdit
}) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const handleDownload = (document) => {
    window.open(document.file_url, '_blank');
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedDocuments = () => {
    if (!sortConfig.key) return documents;

    return [...documents].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === 'datum' || sortConfig.key === 'created_date') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      if (sortConfig.key === 'version_number') { 
        const aNum = Number(aValue) || 0;
        const bNum = Number(bValue) || 0;
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const SortableHeader = ({ children, sortKey }) => (
    <TableHead 
      className="cursor-pointer hover:bg-slate-100 transition-colors select-none"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        {getSortIcon(sortKey)}
      </div>
    </TableHead>
  );

  const isAllSelected = documents.length > 0 && selectedDocuments.length === documents.length;
  const isIndeterminate = selectedDocuments.length > 0 && selectedDocuments.length < documents.length;

  if (isLoading) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {Array(9).fill(0).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                {Array(9).fill(0).map((_, i) => <TableCell key={i}><Skeleton className="h-5 w-full" /></TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
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
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedDocuments.length > 0 && (
        <Card className="border-slate-200 bg-blue-50 border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedDocuments.length} Dokument{selectedDocuments.length > 1 ? 'e' : ''} ausgewählt
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkEdit}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Edit className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDelete}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Löschen
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onCheckedChange={onSelectAll}
                    aria-label="Alle auswählen"
                  />
                </TableHead>
                <SortableHeader sortKey="name">Name</SortableHeader>
                <SortableHeader sortKey="version_number">Version</SortableHeader>
                <SortableHeader sortKey="dokumentart">Dokumentart</SortableHeader>
                <SortableHeader sortKey="hersteller">Hersteller</SortableHeader>
                <SortableHeader sortKey="produkt">Produkt</SortableHeader>
                <SortableHeader sortKey="gehoert_zu">Gehört zu</SortableHeader>
                <SortableHeader sortKey="datum">Datum</SortableHeader>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedDocuments().map((document) => (
                <TableRow 
                  key={document.id} 
                  className={`hover:bg-slate-50 transition-colors ${
                    selectedDocuments.includes(document.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedDocuments.includes(document.id)}
                      onCheckedChange={() => onSelectDocument(document.id)}
                      aria-label={`${document.name} auswählen`}
                    />
                  </TableCell>
                  <TableCell 
                    className="font-medium text-slate-900 cursor-pointer group"
                    onClick={() => onPreviewDocument(document)}
                    title={document.name}
                  >
                    <div className="flex items-center gap-3">
                      <FileTypeIcon fileName={document.file_name} className="w-5 h-5 flex-shrink-0" />
                      <span className="group-hover:text-blue-600 transition-colors">{document.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{document.version_number}</TableCell>
                  <TableCell>
                    <Badge className={`${documentTypeColors[document.dokumentart]} border w-fit`}>
                      {document.dokumentart}
                    </Badge>
                  </TableCell>
                  <TableCell>{document.hersteller}</TableCell>
                  <TableCell>{document.produkt}</TableCell>
                  <TableCell>{document.gehoert_zu || '-'}</TableCell>
                  <TableCell>{format(new Date(document.datum), "dd.MM.yyyy", { locale: de })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-slate-200">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
