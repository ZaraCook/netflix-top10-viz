const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const inputPath = path.join(__dirname, "..", "raw-data", "all-weeks-global.xlsx");
const outputDir = path.join(__dirname, "..", "public", "data");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const workbook = XLSX.readFile(inputPath);
const sheetNames = workbook.SheetNames;

let rows = [];

for (const sheetName of sheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  const normalized = data.map((row, index) => ({
    id: `${sheetName}-${index}`,
    week: row["Week"] || row["week"] || null,
    category: row["Category"] || row["category"] || sheetName,
    rank: Number(row["Rank"] || row["rank"] || 0),
    title: row["Title"] || row["title"] || "",
    seasonTitle: row["Season Title"] || row["season_title"] || "",
    hoursViewed: Number(row["Hours Viewed"] || row["hours_viewed"] || 0),
    runtime: Number(row["Runtime"] || row["runtime"] || 0),
    views: Number(row["Views"] || row["views"] || row["Weekly Views"] || 0),
    weeksInTop10: Number(row["Weeks in Top 10"] || row["weeks_in_top_10"] || 0),
    sourceSheet: sheetName,
  }));

  rows.push(...normalized);
}

rows = rows.filter((d) => d.title || d.seasonTitle);

fs.writeFileSync(
  path.join(outputDir, "weekly_top10.json"),
  JSON.stringify(rows, null, 2)
);

const byTitle = {};

for (const row of rows) {
  const key = row.title || row.seasonTitle;
  if (!key) continue;

  if (!byTitle[key]) {
    byTitle[key] = {
      title: key,
      category: row.category,
      peakRank: row.rank || 999,
      weeksCharted: 0,
      totalViews: 0,
      totalHours: 0,
      firstWeek: row.week,
      lastWeek: row.week,
    };
  }

  byTitle[key].peakRank = Math.min(byTitle[key].peakRank, row.rank || 999);
  byTitle[key].weeksCharted += 1;
  byTitle[key].totalViews += row.views || 0;
  byTitle[key].totalHours += row.hoursViewed || 0;

  if (row.week && (!byTitle[key].firstWeek || row.week < byTitle[key].firstWeek)) {
    byTitle[key].firstWeek = row.week;
  }

  if (row.week && (!byTitle[key].lastWeek || row.week > byTitle[key].lastWeek)) {
    byTitle[key].lastWeek = row.week;
  }
}

fs.writeFileSync(
  path.join(outputDir, "title_summary.json"),
  JSON.stringify(Object.values(byTitle), null, 2)
);

console.log("Done. Created weekly_top10.json and title_summary.json");