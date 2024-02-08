import React, { useState } from 'react';
import * as ExcelJS from 'exceljs';

interface ColumnMatcherProps {
  data: ColumnMatcherData;
  onMappingChange: (paymentForms: PaymentForm[]) => void;
}

interface ColumnMatcherData {
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

const ColumnMatcher: React.FC<ColumnMatcherProps> = ({ data, onMappingChange }) => {
  const [mappings, setMappings] = useState<Record<string, keyof PaymentForm>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const paymentFormFields: Array<keyof PaymentForm> = ["amount", "dateString",  "description",  "invoice_number", "subcontractor"];


  const handleMappingChange = (excelColumn: string, mappedField: keyof PaymentForm) => {
    setMappings(prev => ({ ...prev, [excelColumn]: mappedField }));
  };

  

const processCellValue = (cellValue: ExcelJS.CellValue): string | number | null => {
  // Check if it's a cell object with a formula
  if (typeof cellValue === 'object' && cellValue && 'result' in cellValue) {
    // Check if the result is neither null nor undefined, then return it as a string
    if (cellValue.result !== null && cellValue.result !== undefined) {
      return cellValue.result.toString();
    }
    return null; // Return null if the result is null or undefined
  }

  // For other types of cells (string, number), return the value directly
  if (typeof cellValue === 'number' || typeof cellValue === 'string') {
    return cellValue;
  }

  return null; // Return null for all other cases
};


const getColumnHeaders = (worksheet: ExcelJS.Worksheet): string[] => {
  const headerRow = worksheet.getRow(1);
  if (!headerRow || !headerRow.values) {
    return [];
  }
  const values = Array.isArray(headerRow.values) ? headerRow.values : [];
  return values.filter((value): value is string => typeof value === 'string').slice(1);
};



const worksheetToArrayOfObjects = (worksheet: ExcelJS.Worksheet): Record<string, any>[] => {
  const headers = getColumnHeaders(worksheet);

  const rowObjects = worksheet.getSheetValues().slice(2).map(row => {
    if (!Array.isArray(row)) return null;

    const rowObject = headers.reduce((obj, header, index) => {
      const cellValue = row[index + 2]; // ensure the index aligns with your data structure
      if (cellValue !== undefined) {
        obj[header] = processCellValue(cellValue);
      }
      return obj;
    }, {} as Record<string, any>);

    const hasNonEmptyCell = Object.values(rowObject).some(cell => cell !== null && cell !== '');
    return hasNonEmptyCell ? rowObject : null;
  });

  // Filter out null values to ensure the returned array only contains Record<string, any> objects
  return rowObjects.filter(rowObject => rowObject !== null) as Record<string, any>[];
};


// Function to apply mappings and process data
const processMappedData = (dataArray: Record<string, any>[]): PaymentForm[] => {
  return dataArray.map(rowObject => {
    return Object.entries(mappings).reduce((processedRow, [excelColumn, paymentFormField]) => {
      if (excelColumn in rowObject) {
        // Apply your specific field handlers here
        processedRow[paymentFormField] = rowObject[excelColumn]; // Replace with actual processing logic
      }
      return processedRow;
    }, {} as PaymentForm);
  });
};

const getAvailableOptions = (currentHeader: string) => {
  const selectedFields = new Set(Object.values(mappings));
  return paymentFormFields.filter(field => !selectedFields.has(field) || mappings[currentHeader] === field);
};

// Confirm mappings and process data
const handleConfirm = async (): Promise<void> => {
  try {
    const dataArray = worksheetToArrayOfObjects(data.workSheet);
    const processedData = processMappedData(dataArray);
    onMappingChange(processedData);
  } catch (error) {
    console.error("Error processing data:", error);
    // Handle error appropriately (e.g., update state, show notification)
  }
};
const headers = getColumnHeaders(data.workSheet);

return (
  <>
    <div className="space-y-4">
      {headers.map((header) => (
        <div key={header} className="flex flex-col md:flex-row items-center md:space-x-2 space-y-2 md:space-y-0">
          <label className="text-sm font-medium text-gray-700 w-full md:w-auto">{header}</label>
          <select
            onChange={(e) => handleMappingChange(header, e.target.value as keyof PaymentForm)}
            value={mappings[header] || ''}
            className={`block w-full px-3 py-2 bg-white border ${errors[header] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          >
            <option value="">-- Select a Field --</option>
            {getAvailableOptions(header).map((field, fieldIndex) => (
              <option key={fieldIndex} value={field}>
                {field}
              </option>
            ))}
          </select>
          {errors[header] && (
            <p className="text-red-500 text-xs">{errors[header]}</p>
          )}
        </div>
      ))}
    </div>
    <div className="flex justify-end space-x-4 mt-4">
      <button
        onClick={handleConfirm}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
      >
        Confirm Mappings
      </button>
    </div>

      
    </>
  );
};
export default ColumnMatcher;
