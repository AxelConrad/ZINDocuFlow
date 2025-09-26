import React from 'react';
import { File, FileText, FileImage, FileArchive, FileSpreadsheet } from 'lucide-react';

const FileTypeIcon = ({ fileName, className = "w-5 h-5" }) => {
    const getFileExtension = (name) => {
        if (!name) return '';
        return name.split('.').pop().toLowerCase();
    };

    const extension = getFileExtension(fileName);

    switch (extension) {
        case 'pdf':
            return <FileText className={`${className} text-red-500`} />;
        case 'doc':
        case 'docx':
            return <FileText className={`${className} text-blue-500`} />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
            return <FileImage className={`${className} text-purple-500`} />;
        case 'xls':
        case 'xlsx':
            return <FileSpreadsheet className={`${className} text-green-500`} />;
        case 'zip':
        case 'rar':
            return <FileArchive className={`${className} text-yellow-500`} />;
        default:
            return <File className={`${className} text-slate-500`} />;
    }
};

export default FileTypeIcon;