const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const app = express();
const port = 5000;

// Ensure the downloads directory exists
const downloadsDir = "./downloads";
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Enable CORS
app.use(cors());

app.use("/downloads", express.static(path.join(__dirname, "downloads")));

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);  // Create it if it doesn't exist
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// CORS policy for specific origins (optional)
// app.use(cors({ origin: 'http://localhost:3000' }));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded or invalid file type." });
  }

  // File uploaded successfully
  const filePath = req.file.path;
  console.log("File uploaded:", filePath);

  // Process the file (your business logic goes here)
  const workbook = xlsx.readFile(filePath, { cellDates: true, raw: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { raw: true });

  // Example of generating downloadable files (implement your logic here)
  const columnGroups = {
    SAL: ["EE NAME", " HOURS ", "EE ID", "DEPT", "GL", " GROSS ", "", " Employee Title ", " Department NS "],
    FICA: ["EE NAME", "EE ID", "DEPT", "GL", " FICA ", "", " Employee Title ", " Department NS "],
    MTA: ["EE NAME", "EE ID", "DEPT", "GL", " MTA ", "", " Employee Title ", " Department NS "],
    MATCH: ["EE NAME", "EE ID", "DEPT", "GL", " MATCH ", "", " Employee Title ", " Department NS "],
  };

  const processedFiles = [];
  
  Object.entries(columnGroups).forEach(([filename, columns]) => {
    const filteredData = jsonData.map((row) =>
      Object.fromEntries(columns.map((col) => [col, row[col] !== undefined ? row[col].toString() : ""]))
    );

    console.log("Processed Data:", filteredData);

    const newSheet = xlsx.utils.json_to_sheet(filteredData);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");

    // Apply number formatting
    const range = xlsx.utils.decode_range(newSheet["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = xlsx.utils.encode_cell({ r: R, c: C });
        if (newSheet[cellAddress] && typeof newSheet[cellAddress].v === "number") {
          newSheet[cellAddress].z = "0.00"; // Ensure two decimal places
        }
      }
    }

    const outputFilePath = path.join(downloadsDir, `${filename}.xlsx`);
    xlsx.writeFile(newWorkbook, outputFilePath);
    processedFiles.push(outputFilePath);
  });

  // Create a zip file with the 4 XLSX files
  const zipFilePath = path.join(downloadsDir, "files.zip");
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);
  processedFiles.forEach((file) => {
    archive.append(fs.createReadStream(file), { name: path.basename(file) });
  });

  archive.finalize();

  output.on("close", () => {
    console.log(`ZIP file has been created: ${zipFilePath}`);
    res.download(zipFilePath, "files.zip", (err) => {
      if (err) {
        console.log("Error in file download:", err);
      }

      // Clean up after download
      fs.rmdirSync(downloadsDir, { recursive: true });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});