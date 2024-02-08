import React, { useState } from 'react';
import FileUpload from './FileUpload';
import SheetSelection from './SheetSelection';
import ColumnMatcher from './ColumnMatcher';
import DataReview from './dataReview';
import * as ExcelJS from 'exceljs';

interface FileData {
  hasMultipleSheets: boolean;
  workbook: ExcelJS.Workbook;
  fileName: string;
}

interface SheetData {
  workbook: ExcelJS.Workbook;
  selectedSheetName: string;
  workSheet: ExcelJS.Worksheet;
}

interface PaymentForm {
  amount: number | null;
  dateString: string | null;
  transactionType: string | null;
  client: string | null;
  description: string | null;
  categories: string | null;
  invoice_number: string | null;
  subcontractor: string | null;
}

const IndexPage: React.FC<{ clientId: string, projectId: string, companyId:string }> = ({ clientId, projectId, companyId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [selectedSheetData, setSelectedSheetData] = useState<SheetData | null>(null);
  const [paymentForms, setPaymentForms] = useState<PaymentForm[]>([]);

  const handleFileUpload = (uploadedData: FileData) => {
    setFileData(uploadedData);
    setCurrentStep(2); // Move to sheet selection step
  };

  const handleSheetSelection = (selectedSheet: SheetData) => {
    setSelectedSheetData(selectedSheet);
    setCurrentStep(3); // Move to column matcher step
  };

  const handleColumnMatcher = (mappedPaymentForms: PaymentForm[]) => {
    setPaymentForms(mappedPaymentForms);
    setCurrentStep(4); // Move to the next step
  };

  return (
    <div className="container mx-auto p-4">
      {currentStep === 1 && <FileUpload onUpload={handleFileUpload} />}
      {currentStep === 2 && fileData && (
        <SheetSelection 
          workbook={fileData.workbook}
          onSelectSheet={handleSheetSelection} 
        />
      )}
      {currentStep === 3 && selectedSheetData && (
        <ColumnMatcher 
          data={{ workSheet: selectedSheetData.workSheet, selectedSheetName: selectedSheetData.selectedSheetName }}
          onMappingChange={handleColumnMatcher}
        />
      )}
      {currentStep === 4 && <DataReview paymentForms={paymentForms} clientId={clientId} projectId={projectId} companyId={companyId}/>}
    </div>
  );
};

export default IndexPage;
