# Netflix Top 10 Visualization

A comprehensive interactive dashboard for analyzing Netflix's global top 10 rankings across categories, time periods, and individual titles. Explore trends, compare shows/seasons, and discover patterns in streaming performance.

**Live Demo:** https://zaracook.github.io/netflix-top10-viz

## Features

### 📊 Home (Overview)
- High-level KPI metrics: total titles, weeks charted, categories, avg longevity, total views, and hours viewed
- Category-based trend analysis with weekly views over time
- Most-watched titles by total views
- Views distribution by category (pie chart)

### 🔍 Title Explorer (Deep Dive)
- Search and explore individual titles with season support
- Rank trajectory over time with interactive chart
- Recent weekly ranking snapshots
- Season-by-season comparison:
  - Comparative rank trajectories
  - Durability metrics by season
  - Seasonal views distribution
  - Views trend by season

### ⚖️ Compare (Side-by-Side)
- Select and compare 2 shows/seasons on a single timeline
- Dual-line rank chart with distinct colors
- Hover tooltips showing rank, views, and date
- Type-to-filter combo search for quick selection
- Year/month filtering for targeted comparison windows

### 🔬 Insights Lab (Diagnostics)
- **Rank Density Heatmap:** Distribution of titles across different rank positions
- **Reach vs. Longevity Scatter:** Correlation between total views and weeks charted
- **Most Durable Titles:** Identify shows with consistent performance
- **#1 Winners by Category:** Pie chart showing which categories dominate #1 positions
- **Weekly #1 Trends:** Multi-line chart tracking #1 rankings by category over time

## Tech Stack

- **Frontend:** React 18 with React Router v7
- **Data Visualization:** D3.js v7
- **Build Tool:** Create React App
- **Deployment:** GitHub Pages
- **Data Processing:** Node.js script with XLSX parsing

## Project Structure

```
netflix-top10-viz/
├── public/
│   ├── data/
│   │   ├── weekly_top10.json      # Weekly rankings (9920+ rows)
│   │   └── title_summary.json      # Title aggregates (3500+ entries)
│   └── index.html
├── scripts/
│   └── processWorkbook.js          # Data pipeline from Excel → JSON
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── RankChart.js            # Single-line rank visualization
│   │   └── CompareRankChart.js     # Dual-line comparison
│   ├── pages/
│   │   ├── Home.js                 # Overview dashboard
│   │   ├── TitleExplorer.js        # Deep-dive & season analysis
│   │   ├── Compare.js              # Side-by-side ranking comparison
│   │   └── Insights.js             # Diagnostics & pattern exploration
│   ├── hooks/
│   │   └── useNetflixData.js       # Data loading hook
│   ├── utils/
│   │   └── analytics.js            # Analytics aggregations & formatting
│   ├── App.js
│   └── index.js
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

```bash
git clone https://github.com/ZaraCook/netflix-top10-viz.git
cd netflix-top10-viz
npm install
```

### Development

```bash
npm start
```

Runs the app at [http://localhost:3000](http://localhost:3000). The page reloads on changes.

### Build for Production

```bash
npm run build
```

Creates an optimized production build in the `build` folder.

### Deploy to GitHub Pages

```bash
npm run deploy
```

Automatically builds and deploys to GitHub Pages. Uses the `gh-pages` package to manage the deployment branch.

## Data Pipeline

### Raw Data Source
- Netflix weekly top 10 rankings from `raw-data/all-weeks-global.xlsx`

### Processing (`scripts/processWorkbook.js`)
- Parses Excel workbook with XLSX library
- Separates TV shows and movies into distinct rows per season
- Aggregates views and hours by title/season/week
- Generates two JSON outputs:

**weekly_top10.json:** Weekly rankings with structure:
```json
{
  "week": "2023-07-16",
  "title": "Bridgerton",
  "seasonTitle": "Season 1",
  "displayTitle": "Bridgerton: Season 1",
  "category": "TV (English)",
  "rank": 5,
  "views": 15200000,
  "hours": 125600000
}
```

**title_summary.json:** Aggregated title statistics:
```json
{
  "title": "Bridgerton",
  "seasonTitle": "Season 1",
  "displayTitle": "Bridgerton: Season 1",
  "category": "TV (English)",
  "peakRank": 1,
  "weeksCharted": 12,
  "totalViews": 182400000,
  "totalHours": 1507200000,
  "firstWeek": "2023-07-16",
  "lastWeek": "2023-10-08"
}
```

### Regenerating Data
If you update the raw Excel file:
```bash
node scripts/processWorkbook.js
```

This regenerates both JSON files in `public/data/`.

## Key Features & UX

### Unified Filtering
- **Title Search:** Multi-field search across title, season, and display name
- **Content Type:** Filter by Movies or TV Shows
- **Year/Month:** Date range selection
- **Clear Filters:** Reset all selections at once

### Merged Combo Controls
- Type-to-filter selectors combining search and dropdown functionality
- Autocomplete suggestions for quick navigation
- Consistent across all pages for familiar UX

### Analytics Utilities (`src/utils/analytics.js`)
- `formatCompactNumber()` - Format large numbers as K/M/B notation
- `filterBySearch()` - Multi-field text filtering
- `filterWeeklyByYearMonth()` - Date range filtering
- `getTitleRankHistory()` - Season-aware rank extraction
- `getNumberOneCategoryShare()` - #1 winner breakdown
- `getWeeklyNumberOneTrend()` - Weekly #1 trends by category
- `getSeasonComparisonData()` - Season-level aggregations

### Chart Types
- **Line Charts:** Rank trajectories over time
- **Bar Charts:** Top titles, durability metrics
- **Pie Charts:** Category distribution, #1 winners
- **Heatmap:** Rank density distribution
- **Scatter Plot:** Reach vs. longevity correlation
- **Multi-line Charts:** Category trends

## Scripts

```bash
npm start          # Start dev server (http://localhost:3000)
npm build          # Build for production
npm test           # Run tests
npm run deploy      # Build & deploy to GitHub Pages
```

## Deployment

This project is configured for GitHub Pages:
- **Repository:** github.com/ZaraCook/netflix-top10-viz
- **Live Site:** https://zaracook.github.io/netflix-top10-viz
- **Deployment:** Automatic via `npm run deploy` (uses gh-pages package)
- **Base Path:** `/netflix-top10-viz`

### Environment Setup
- `homepage` in `package.json` configured for GitHub Pages path
- `Router basename` in `App.js` set to `/netflix-top10-viz`
- Data paths use `process.env.PUBLIC_URL` for cross-environment compatibility

## Browser Compatibility
- Modern browsers with ES6+ support
- Tested on Chrome, Firefox, Safari, Edge

## License
MIT

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests for improvements.

---

**Built with ❤️ using React and D3.js**

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
