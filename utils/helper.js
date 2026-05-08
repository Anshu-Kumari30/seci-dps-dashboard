const ExcelJS = require("exceljs");

const normalizeDate = (dateStr) => {
  // expects DD/MM/YYYY
  if (!dateStr || typeof dateStr !== "string") return null;

  const [dd, mm, yyyy] = dateStr.split("/");
  if (!dd || !mm || !yyyy) return null;

  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
};

const isNumber = (val) => {
  if (val === null || val === "") return true; // allow empty
  return !isNaN(Number(val));
};

const streamExcel = async ({
  res,
  sheetName = "Data",
  fileName = "report.xlsx",
  data,
}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Dynamic columns
  worksheet.columns = Object.keys(data[0]).map((key) => ({
    header: key.replace(/_/g, " ").toUpperCase(),
    key,
    width: 20,
  }));

  worksheet.addRows(data);

  // Style header
  worksheet.getRow(1).font = { bold: true };

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  normalizeDate,
  isNumber,
  streamExcel,
};
