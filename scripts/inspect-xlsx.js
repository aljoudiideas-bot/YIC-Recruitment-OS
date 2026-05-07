const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "Comprehensive File 2026 تحديث ابو فيصل (1).xlsx");
const workbook = XLSX.readFile(filePath);

console.log("Sheets:", workbook.SheetNames);

workbook.SheetNames.forEach((name) => {
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  
  console.log(`\n=== Sheet: ${name} ===`);
  console.log(`Total Rows: ${data.length}`);
  
  if (data.length > 0) {
    console.log("Headers:", Object.keys(data[0]));
    console.log("First Row Sample:", JSON.stringify(data[0], null, 2));
    if (data.length > 1) {
      console.log("Second Row Sample:", JSON.stringify(data[1], null, 2));
    }
  }
});
