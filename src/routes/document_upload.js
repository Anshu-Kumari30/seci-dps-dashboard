const multer = require("multer");
const path = require("path");
const {
  EntityDocs,
  EntityCorrespondence,
  EntityIssues,
  REIADocuments,
  OMDGR,
  OMDGRSolarBESS,
  OMDGRSolar,
} = require("../models").models;

const { verifyToken } = require("../middleware/verify_token");
const XLSX = require("xlsx");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // ensure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

const addDocument = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id, doc_name, doc_type, doc_date } =
      req.body;
    const filePath = req.file ? req.file.path : null;

    if (!filePath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!doc_name) {
      // generate a random doc_name
    }

    // console.log(`HELLOOO: ${entity_id}`)

    const doc = await EntityDocs.create({
      dept_id: dept_id,
      statistic_id: statistic_id,
      entity_id: entity_id,
      doc_name: doc_name,
      doc_type: doc_type,
      doc_path: filePath,
      doc_date: doc_date,
    });

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add document" });
  }
};

const addCorrespondence = async (req, res) => {
  try {
    const {
      dept_id,
      statistic_id,
      entity_id,
      subject,
      from,
      to,
      correspondence_date,
      correspondence_type,
    } = req.body;
    const filePath = req.file ? req.file.path : null;
    const corr = await EntityCorrespondence.create({
      dept_id: dept_id,
      statistic_id: statistic_id,
      entity_id: entity_id,
      subject: subject,
      from: from,
      to: to,
      doc_name: `${filePath}`,
      correspondence_date: correspondence_date,
      doc_path: filePath,
      correspondence_type: correspondence_type,
    });
    res.json(corr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add correspondence" });
  }
};

const addIssue = async (req, res) => {
  try {
    const {
      dept_id,
      statistic_id,
      entity_id,
      issue_description,
      issue_pertaining_to,
      issue_date,
    } = req.body;
    const filePath = req.file ? req.file.path : null;
    const issue = EntityIssues.create({
      dept_id: dept_id,
      statistic_id: statistic_id,
      entity_id: entity_id,
      issue_description: issue_description,
      issue_pertaining_to: issue_pertaining_to,
      issue_date: issue_date,
      issue_doc_path: filePath,
    });
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add issue" });
  }
};

const updateREIADocument = async (req, res) => {
  try {
    const { reia_doc_type, last_updated_on } = req.body;

    // Validate input
    if (!reia_doc_type || !last_updated_on) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const filePath = req.file ? req.file.path : null;
    const reia_doc_path = filePath || null; // If there's no file uploaded, keep the existing path

    // Find the document by ID and update it
    const document = await REIADocuments.findOne({
      where: { reia_doc_type },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Update the document with the new details
    document.reia_doc_path = reia_doc_path || document.reia_doc_path; // Don't overwrite path if no new file is uploaded
    document.last_updated_on = last_updated_on;

    await document.save(); // Save the updated document

    return res.status(200).json(document);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const addOMEntriesByExcel = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.params;
    const filePath = req.file ? req.file.path : null;
    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    console.log("file uploaded");

    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false });

    // TODO: Add code to add entries using this data

    for (const lineItem of jsonData) {
      console.log("adding entry");

      const date = lineItem.date;
      const generation = lineItem.generation;
      const machine_availability = lineItem.machine_availability;
      const grid_availability = lineItem.grid_availability;
      const cumulative_generation = lineItem.cumulative;
      const radiation = lineItem.radiation;

      function parseDate(dateStr) {
        const [day, month, year] = dateStr
          .split("/")
          .map((num) => parseInt(num, 10));
        return new Date(year, month - 1, day); // JS months are 0-indexed
      }

      if (
        date == null ||
        generation == null ||
        radiation == null ||
        machine_availability == null ||
        grid_availability == null ||
        cumulative_generation == null
      ) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      let parsedDate = parseDate(date);

      let cuf_till_date =
        cumulative_generation /
        (grid_availability * 24.0 * 100.0 * parsedDate.getDate());

      //check if entry for this date exists already
      const existingEntry = await OMDGR.findOne({
        where: {
          date: parsedDate,
        },
      });

      if (existingEntry !== null) {
        continue; //dont add this entry
      }

      const newRecord = await OMDGR.create({
        dept_id,
        statistic_id,
        entity_id,
        date: parsedDate,
        generation,
        radiation,
        machine_availability,
        grid_availability,
        cumulative_generation,
        cuf_till_date,
        is_active: true,
      });
    }

    return res.status(201).json({
      message: "OMDGR excel file uploaded successfully.",
    });
  } catch (error) {
    console.error("Error in addEntriesByExcel:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const upsertOMSolarBESSData = async (req, res) => {
  function convertDDMMYYYY(dateStr) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  try {
    const { dept_id, statistic_id, entity_id } = req.query;
    const filePath = req.file ? req.file.path : null;
    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      cellDates: true,
    });

    for (let i = 0; i < jsonData.length; i++) {
      try {
        jsonData[i].dept_id = dept_id;
        jsonData[i].statistic_id = statistic_id;
        jsonData[i].entity_id = entity_id;
        jsonData[i].date = convertDDMMYYYY(jsonData[i].date);

        //check if the entry for the same date exists already
        const foundEntryForThisDate = await OMDGRSolarBESS.findAll({
          where: { date: jsonData[i].date },
        });

        if (foundEntryForThisDate.length === 0) {
          //create the entry only if it does not exist for this date
          await OMDGRSolarBESS.create(jsonData[i]);
        }
      } catch (error) {
        // console.error(jsonData[i].date);
        continue;
      }
    }

    return res.status(200).json({
      message: "Upserted Solar+BESS data",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Erro",
    });
  }
};

const validateSolarRowTypes = (row) => {
  const errors = [];

  const numericFields = [
    "days",
    "generation",
    "radiation",
    "machine_availability",
    "grid_availability",
    "peak_power",
    "cumulative_generation",
    "cuf",
    "cuf_till_date",
  ];

  // date validation
  if (!row.date || typeof row.date !== "string") {
    errors.push({
      field: "date",
      value: row.date,
      type: typeof row.date,
      expected: "DD/MM/YYYY (string)",
    });
  }

  // numeric fields validation
  for (const field of numericFields) {
    if (!isNumber(row[field])) {
      errors.push({
        field,
        value: row[field],
        type: typeof row[field],
        expected: "number",
      });
    }
  }

  return errors;
};

const uploadOMSolarFromExcel = async (req, res) => {
  try {
    console.log("Solar, Upload from excel called");

    const { dept_id, statistic_id, entity_id } = req.query;

    if (!dept_id || !statistic_id || !entity_id) {
      return res.status(400).json({
        message: "dept_id, statistic_id and entity_id are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Excel file is required",
      });
    }

    /* ---------- Read Excel ---------- */
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      defval: null,
    });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    /* ---------- Process Rows ---------- */
    for (const row of rows) {
      try {
        const typeErrors = validateSolarRowTypes(row);

        if (typeErrors.length) {
          console.error("❌ Datatype mismatch found:");
          console.table(typeErrors);
          console.error("Row data:", row);
          skipped++;
          continue;
        }

        const normalizedDate = normalizeDate(row.date);

        /* ---------- Check Existing Record ---------- */
        const existingRecord = await OMDGRSolar.findOne({
          where: {
            dept_id,
            statistic_id,
            entity_id,
            date: normalizedDate,
          },
        });

        const payload = {
          days: row.days,
          generation: row.generation,
          radiation: row.radiation,
          machine_availability: row.machine_availability,
          grid_availability: row.grid_availability,
          peak_power: row.peak_power,
          cumulative_generation: row.cumulative_generation,
          cuf: row.cuf,
          cuf_till_date: row.cuf_till_date,
          remarks: row.remarks || null,
          is_active: 1,
        };

        if (existingRecord) {
          /* ---------- UPDATE ---------- */
          await existingRecord.update(payload);
          updated++;
        } else {
          /* ---------- INSERT ---------- */
          await OMDGRSolar.create({
            dept_id,
            statistic_id,
            entity_id,
            om_dgr_solar_id: uuidv4(),
            date: normalizedDate,
            ...payload,
          });
          inserted++;
        }
      } catch (rowError) {
        console.error("Row failed:", row, rowError.message);
        skipped++;
      }
    }

    return res.status(200).json({
      message: "OM Solar Excel processed successfully",
      summary: {
        totalRows: rows.length,
        inserted,
        updated,
        skipped,
      },
    });
  } catch (error) {
    console.error("Excel Upload Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const validateSolarBessRowTypes = (row) => {
  const schema = {
    days: "number",
    generation: "number",
    radiation: "number",
    bess_export: "number",
    bess_import: "number",
    plant_availability: "number",
    bess_availability: "number",
    grid_availability: "number",
    peak_power: "number",
    cumulative_generation: "number",
    cumulative_bess_export: "number",
    cumulative_bess_import: "number",
    daily_cuf_worc: "number",
    cuf_till_date: "number",
  };

  const errors = [];

  for (const field in schema) {
    const val = row[field];
    if (val === null || val === undefined || val === "") continue;

    if (schema[field] === "number" && isNaN(Number(val))) {
      errors.push({
        field,
        value: val,
        type: typeof val,
        expected: "number",
      });
    }
  }

  return errors;
};

const uploadOMSolarBessFromExcel = async (req, res) => {
  try {
    console.log("Solar+BESS, Upload from excel called");

    const { dept_id, statistic_id, entity_id } = req.query;

    if (!dept_id || !statistic_id || !entity_id) {
      return res.status(400).json({
        message: "dept_id, statistic_id and entity_id are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Excel file is required",
      });
    }

    /* ---------- Read Excel ---------- */
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      defval: null,
    });

    if (!rows.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    /* ---------- Process Rows ---------- */
    for (const row of rows) {
      try {
        const typeErrors = validateSolarBessRowTypes(row);
        if (typeErrors.length) {
          console.error("❌ Datatype mismatch:", typeErrors);
          skipped++;
          continue;
        }

        const normalizedDate = normalizeDate(row.date);
        if (!normalizedDate) {
          skipped++;
          continue;
        }

        const payload = {
          dept_id,
          statistic_id,
          entity_id,
          date: normalizedDate,
          days: row.days,
          generation: row.generation,
          radiation: row.radiation,
          bess_export: row.bess_export,
          bess_import: row.bess_import,
          plant_availability: row.plant_availability,
          bess_availability: row.bess_availability,
          grid_availability: row.grid_availability,
          peak_power: row.peak_power,
          cumulative_generation: row.cumulative_generation,
          cumulative_bess_export: row.cumulative_bess_export,
          cumulative_bess_import: row.cumulative_bess_import,
          daily_cuf_worc: row.daily_cuf_worc,
          cuf_till_date: row.cuf_till_date,
          remarks: row.remarks || null,
          is_active: row.is_active ?? 1,
        };

        const existingRecord = await OMDGRSolarBESS.findOne({
          where: {
            dept_id,
            statistic_id,
            entity_id,
            date: normalizedDate,
          },
        });

        /* -------- ADD -------- */
        if (!existingRecord) {
          await OMDGRSolarBESS.create(payload);
          inserted++;
        } else {
          /* -------- UPDATE -------- */
          await existingRecord.update(payload);
          updated++;
        }
      } catch (rowError) {
        console.error("❌ Row failed:", row, rowError.message);
        skipped++;
      }
    }

    return res.status(200).json({
      message: "OM DGR Solar + BESS Excel processed successfully",
      summary: {
        totalRows: rows.length,
        inserted,
        updated,
        skipped,
      },
    });
  } catch (error) {
    console.error("Excel Upload Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const express = require("express");
const { json } = require("sequelize");
const { isNumber, normalizeDate } = require("../utils/helper");
const router = express.Router();
router.post("/", verifyToken, upload.single("doc_file"), addDocument);

router.post("/add", verifyToken, upload.single("doc_file"), addCorrespondence);

router.post("/new", verifyToken, upload.single("doc_file"), addIssue);

// REIA document
router.post(
  "/update",
  verifyToken,
  upload.single("doc_file"),
  updateREIADocument
);

// Upload O&M file using excel mode
router.post(
  "/one/:dept_id/:statistic_id/:entity_id",
  verifyToken,
  upload.single("doc_file"),
  addOMEntriesByExcel
);

router.post(
  "/solar_bess",
  verifyToken,
  upload.single("excelFile"),
  uploadOMSolarBessFromExcel
);

router.post(
  "/solar",
  verifyToken,
  upload.single("excelFile"),
  uploadOMSolarFromExcel
);

module.exports = router;
