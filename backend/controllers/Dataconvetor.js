import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Function to create a SHA-256 hash
// const createHash = (value) => {
//   return crypto.createHash('sha256').update(value.toString()).digest('hex');
// };
function createHash(input) {
  
    // Create a SHA-256 hash as a Buffer
    const bufferHash = crypto.createHash('sha256').update(input).digest();

    // Convert the Buffer to a numeric string (big integer)
    const numericHash = BigInt('0x' + bufferHash.toString('hex')).toString();
    console.log("varum iya",input,numericHash);

    return numericHash;
}

// Load Aadhaar and PAN data from Excel
const loadExcelData = () => {
  const excelFilePath = path.join(__dirname, '../routes/excell.xlsx');
  const workbook = XLSX.readFile(excelFilePath);

  // Ensure there are at least two sheets
  if (workbook.SheetNames.length < 2) {
    console.error('Excel file must contain at least two sheets: Aadhaar and PAN.');
    return { aadhaarData: [], panData: [] };
  }

  const aadhaarData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]);
  const panData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[2]]);

  // Hash Aadhaar details
  const hashedAadhaarData = aadhaarData.map(row => ({
    Aadhaar: row.Aadhaar,
    Phone: row.Phone,
    NameHash: row.Name ? createHash(row.Name) : null,
    AddressHash: row.Address ? createHash(row.Address) : null,
    FatherHash: row.fathername ? createHash(row.fathername) : null,
    Age: row.Age,
    Dob: row.Dob
  }));
  // console.log(panData,"this the hashed pan data");
  // Hash PAN details
  const hashedPanData = panData.map(row => ({
    PAN: row.panNumber,
    NameHash: row.name ? createHash(row.name) : '99800285379612662792622630841751282730440001476070744056928159791954568787960', // make it null
    FatherHash: row.fathername ? createHash(row.fathername) : '96040954135296334886561163455499748842948209440623215294879000654116441030714',
    DOB: row.Dob
  }));
  // console.log(hashedPanData,"this is a result ");
  

 
  
  return { aadhaarData: hashedAadhaarData, panData: hashedPanData };
};

// Function to get Aadhaar details by Aadhaar number
const getAadhaarDetails = (aadhaar) => {
  const { aadhaarData } = loadExcelData();
  return aadhaarData.find(row => row.Aadhaar == aadhaar) || {};
};

// Function to get PAN details by PAN number
const getPanDetails = (pan) => {
  const { panData } = loadExcelData();
  return panData.find(row => row.PAN == pan) || {};
};

// Example Usage
// const aadhaarNumber = 123456789012;
// const panNumber = 'ABCDE1234F';

// console.log("Aadhaar Data:", getAadhaarDetails(aadhaarNumber));
// console.log("PAN Data:", getPanDetails(panNumber));

export { getAadhaarDetails, getPanDetails };
