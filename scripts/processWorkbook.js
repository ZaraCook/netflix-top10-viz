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

  const normalized = data.map((row, index) => {
    const week = row["week"] || null;
    const category = row["category"] || sheetName;
    const rank = Number(row["weekly_rank"]);
    const title = row["show_title"] || "";
    const seasonTitle = row["season_title"] || "";
    const hoursViewed = Number(row["weekly_hours_viewed"] || 0);
    const runtime = Number(row["runtime"] || 0);
    const views = Number(row["weekly_views"] || 0);
    const weeksInTop10 = Number(row["cumulative_weeks_in_top_10"] || 0);

    return {
      id: `${sheetName}-${index}`,
      week,
      category,
      rank,
      title,
      seasonTitle,
      hoursViewed,
      runtime,
      views,
      weeksInTop10,
      sourceSheet: sheetName,
    };
  });

  rows.push(...normalized);
}

// keep only rows with a real title and a real rank
rows = rows.filter((d) => d.title && !Number.isNaN(d.rank) && d.rank > 0);

fs.writeFileSync(
  path.join(outputDir, "weekly_top10.json"),
  JSON.stringify(rows, null, 2)
);

const byTitle = {};

for (const row of rows) {
  const key = row.title;
  if (!key) continue;

  if (!byTitle[key]) {
    byTitle[key] = {
      title: key,
      seasonTitle: row.seasonTitle,
      category: row.category,
      peakRank: row.rank,
      weeksCharted: 0,
      totalViews: 0,
      totalHours: 0,
      firstWeek: row.week,
      lastWeek: row.week,
    };
  }

  byTitle[key].peakRank = Math.min(byTitle[key].peakRank, row.rank);
  byTitle[key].weeksCharted += 1;
  byTitle[key].totalViews += row.views || 0;
  byTitle[key].totalHours += row.hoursViewed || 0;

  if (row.week && row.week < byTitle[key].firstWeek) {
    byTitle[key].firstWeek = row.week;
  }

  if (row.week && row.week > byTitle[key].lastWeek) {
    byTitle[key].lastWeek = row.week;
  }
}

fs.writeFileSync(
  path.join(outputDir, "title_summary.json"),
  JSON.stringify(Object.values(byTitle), null, 2)
);

console.log(`Done. Created weekly_top10.json with ${rows.length} rows`);
console.log(`Done. Created title_summary.json with ${Object.keys(byTitle).length} titles`);