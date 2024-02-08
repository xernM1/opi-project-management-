import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import * as ExcelJS from 'exceljs';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface SheetData {
  workbook: ExcelJS.Workbook;
  selectedSheetName: string;
  workSheet: ExcelJS.Worksheet;
}

interface SheetSelectionProps {
  workbook: ExcelJS.Workbook;
  onSelectSheet: (sheetData: SheetData) => void;
}

const SheetSelection: React.FC<SheetSelectionProps> = ({ workbook, onSelectSheet }) => {
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [sheetOptions, setSheetOptions] = useState<{ value: string; label: string }[]>([]);
  const [workSheet, setSelectedSheet] = useState<ExcelJS.Worksheet>();
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [rowData, setRowData] = useState<any[]>([]);

  useEffect(() => {
    const sheets = workbook.worksheets.map(sheet => ({
      value: sheet.name,
      label: sheet.name
    }));
    setSheetOptions(sheets);
  }, [workbook]);

  const handleChange = (selectedOption: any) => {
    const sheetName = selectedOption.value;
    setSelectedSheetName(sheetName);
    const selectedSheet = workbook.getWorksheet(sheetName);
    if (selectedSheet) {
      previewSheet(selectedSheet);
      setSelectedSheet(selectedSheet);
    }
  };

  const handleConfirm = () => {
    if (workSheet) {
      onSelectSheet({ workbook, selectedSheetName, workSheet });
    } else {
      console.error('Selected worksheet does not exist');
      // Handle error appropriately
    }
  };

  const getColumnHeaders = (worksheet: ExcelJS.Worksheet): string[] => {
    const headerRow = worksheet.getRow(1);
    if (!headerRow || !headerRow.values) {
      return [];
    }
    const values = Array.isArray(headerRow.values) ? headerRow.values : [];
    return values.filter((value): value is string => typeof value === 'string').slice(1);
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
  
  

  const worksheetToArrayOfObjects = (worksheet: ExcelJS.Worksheet): Record<string, any>[] => {
    const headers = getColumnHeaders(worksheet);
    return worksheet.getSheetValues().slice(2).map(row => {
      if (!Array.isArray(row)) return {};
      return headers.reduce((obj, header, index) => {
        const cellValue = row[index +2];
        if (cellValue !== undefined) {
          obj[header] = processCellValue(cellValue);
        }
        return obj;
      }, {} as Record<string, any>);
    });
  };

  const previewSheet = (sheet: ExcelJS.Worksheet) => {
    const headers = getColumnHeaders(sheet);
    const columnDefs = headers.map((header, index) => ({
      headerName: header,
      field: header, // Ensure the field matches the keys in the row data
      sortable: true,
      filter: true,
    }));

    const rowData = worksheetToArrayOfObjects(sheet).slice(0, 5); // Preview first 5 rows
    setColumnDefs(columnDefs);
    setRowData(rowData);
  };

  return (
    <div className="container mx-auto p-4">
      <Select
        options={sheetOptions}
        onChange={handleChange}
        className="text-dark mb-4"
        placeholder="Select a sheet"
      />

      {rowData.length > 0 && (
        <div className="ag-theme-alpine sheet-preview" style={{ height: 400 }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            pagination={true}
            paginationPageSize={5}
          />
        </div>
      )}

      <button
        onClick={handleConfirm}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
        disabled={!selectedSheetName}
      >
        Confirm Selection
      </button>
    </div>
  );
};

export default SheetSelection;
