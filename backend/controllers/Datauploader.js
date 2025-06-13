import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load Aadhaar and PAN data from Excel
const loadExcelData = () => {
  const excelFilePath = path.join(__dirname, '../routes/excell.xlsx');
  const workbook = XLSX.readFile(excelFilePath);

  // Ensure there are at least two sheets
  
  const aadhaarData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]);
  const panData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[2]]);

  return { aadhaarData, panData };
};

// Function to get Aadhaar details by Aadhaar number
const getAadhaarDetails = (aadhaar) => {
  const { aadhaarData } = loadExcelData();
  return aadhaarData.find(row => row.Aadhaar == aadhaar) || {};
};

// Function to get PAN details by PAN number
const getPanDetails = (pan) => {
  const { panData } = loadExcelData();
  return panData.find(row => row.panNumber == pan) || {};
};

export { getAadhaarDetails, getPanDetails };
