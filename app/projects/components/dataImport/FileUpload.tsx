import React from 'react';
import * as ExcelJS from 'exceljs';

interface FileUploadProps {
  onUpload: (data: FileData) => void;
}

interface FileData {
  hasMultipleSheets: boolean;
  workbook: ExcelJS.Workbook
  fileName: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const buffer = e.target.result;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      

      
      const fileData: FileData = {
        hasMultipleSheets: workbook.worksheets.length > 1,
        workbook: workbook,
        fileName: file.name
      };

      onUpload(fileData);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
    </div>
  );
};

export default FileUpload;
