import { useMemo, useState } from "react";
import useNetflixData from "../hooks/useNetflixData";
import HorizontalBarChart from "../components/HorizontalBarChart";
import ScatterPlot from "../components/ScatterPlot";
import HeatmapChart from "../components/HeatmapChart";
import MultiLineChart from "../components/MultiLineChart";
import PieChart from "../components/PieChart";
import {
  filterByContentType,
  filterBySearch,
  filterWeeklyByYearMonth,
  formatCompactNumber,
  getAvailableYears,
  getNumberOneCategoryShare,
  getRankDistribution,
  getScatterDataset,
  getTopVolatileTitles,
  getWeeklyNumberOneTrend,
} from "../utils/analytics";

function Insights() {
  const { weeklyData, titleSummary, loading } = useNetflixData();
  const [topN, setTopN] = useState(12);
  const [contentType, setContentType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  const years = useMemo(() => getAvailableYears(weeklyData), [weeklyData]);

  const monthNames = [
    { value: "all", label: "All Months" },
    { value: "1", label: "Jan" },
    { value: "2", label: "Feb" },
    { value: "3", label: "Mar" },
    { value: "4", label: "Apr" },
    { value: "5", label: "May" },
    { value: "6", label: "Jun" },
    { value: "7", label: "Jul" },
    { value: "8", label: "Aug" },
    { value: "9", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];

  const filteredWeekly = useMemo(
    () =>
      filterWeeklyByYearMonth(
        filterBySearch(filterByContentType(weeklyData, contentType), searchTerm, ["title", "seasonTitle"]),
        yearFilter,
        monthFilter
      ),
    [weeklyData, contentType, searchTerm, yearFilter, monthFilter]
  );
  const filteredSummary = useMemo(
    () => {
      const base = filterBySearch(
        filterByContentType(titleSummary, contentType),
        searchTerm,
        ["title", "seasonTitle", "displayTitle"]
      );
      if (yearFilter === "all" && monthFilter === "all") return base;
      const validTitles = new Set(filteredWeekly.map((row) => row.title));
      return base.filter((row) => validTitles.has(row.title));
    },
    [titleSummary, contentType, searchTerm, yearFilter, monthFilter, filteredWeekly]
  );

  const rankHeatmap = useMemo(() => getRankDistribution(filteredWeekly), [filteredWeekly]);
  const scatter = useMemo(() => getScatterDataset(filteredSummary).slice(0, 600), [filteredSummary]);
  const durability = useMemo(() => getTopVolatileTitles(filteredSummary, topN), [filteredSummary, topN]);
  const numberOneShare = useMemo(() => getNumberOneCategoryShare(filteredSummary), [filteredSummary]);
  const numberOneTrend = useMemo(() => getWeeklyNumberOneTrend(filteredWeekly, "views"), [filteredWeekly]);

  if (loading) return <div className="page"><div className="loading">Loading insights engine…</div></div>;

  return (
    <div className="page">
      <h2>Insights Lab</h2>
      <p>Diagnostics view for rank density, longevity, hit quality, and category stickiness.</p>

      <div className="controls-row">
        <label className="control-label">
          Content Type
          <select className="control-input" value={contentType} onChange={(e) => setContentType(e.target.value)}>
            <option value="all">All</option>
            <option value="movies">Movies</option>
            <option value="shows">Shows</option>
          </select>
        </label>

        <label className="control-label">
          List Size
          <input
            className="control-input"
            type="range"
            min="5"
            max="20"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
          />
          <span>{topN}</span>
        </label>

        <label className="control-label" style={{ minWidth: "260px" }}>
          Search Titles
          <input
            type="text"
            className="control-input"
            placeholder="Type words (e.g. squid, love, season)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>

        <label className="control-label">
          Year
          <select className="control-input" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>{year}</option>
            ))}
          </select>
        </label>

        <label className="control-label">
          Month
          <select className="control-input" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            {monthNames.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="clear-button"
          onClick={() => {
            setTopN(12);
            setContentType("all");
            setSearchTerm("");
            setYearFilter("all");
            setMonthFilter("all");
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="chart-card">
        <h3>Rank Density by Category</h3>
        <HeatmapChart data={rankHeatmap} />
      </div>

      <div className="chart-card">
        <h3>Reach vs Longevity</h3>
        <ScatterPlot data={scatter} />
      </div>

      <div className="chart-card">
        <h3>Most Durable Titles</h3>
        <HorizontalBarChart
          data={durability.map((d) => ({ label: d.label, value: d.value }))}
          valueFormatter={formatCompactNumber}
        />
      </div>

      <div className="chart-card">
        <h3>#1 Winners by Category Share</h3>
        <PieChart
          data={numberOneShare}
          title="Category share of #1 winners"
          valueFormatter={formatCompactNumber}
        />
      </div>

      <div className="chart-card">
        <h3>Weekly #1 Views Trend by Category</h3>
        <MultiLineChart data={numberOneTrend} />
      </div>
    </div>
  );
}

export default Insights;