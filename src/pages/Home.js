import useNetflixData from "../hooks/useNetflixData";
import { useMemo, useState } from "react";
import * as d3 from "d3";
import MultiLineChart from "../components/MultiLineChart";
import HorizontalBarChart from "../components/HorizontalBarChart";
import PieChart from "../components/PieChart";
import {
  filterByContentType,
  filterBySearch,
  filterWeeklyByYearMonth,
  formatCompactNumber,
  getAvailableYears,
  getCategoryShare,
  getOverviewStats,
  getTopTitles,
  getWeeklyTrendByCategory,
} from "../utils/analytics";

function Home() {
  const { weeklyData, titleSummary, loading } = useNetflixData();
  const [metric, setMetric] = useState("views");
  const [contentType, setContentType] = useState("all");
  const [titleInput, setTitleInput] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  const years = useMemo(() => getAvailableYears(weeklyData), [weeklyData]);

  const normalizedSummary = useMemo(() => titleSummary || [], [titleSummary]);

  const baseSummary = useMemo(() => {
    const byType = filterByContentType(normalizedSummary, contentType);
    if (yearFilter === "all" && monthFilter === "all") return byType;
    const byDate = filterWeeklyByYearMonth(filterByContentType(weeklyData, contentType), yearFilter, monthFilter);
    const validTitles = new Set(byDate.map((row) => row.title));
    return byType.filter((row) => validTitles.has(row.title));
  }, [normalizedSummary, contentType, yearFilter, monthFilter, weeklyData]);

  const titleOptions = useMemo(() => {
    const options = [...new Set(baseSummary.map((row) => row.displayTitle || row.seasonTitle || row.title).filter(Boolean))].sort();
    const needle = titleInput.trim().toLowerCase();
    if (!needle) return options.slice(0, 180);
    return options.filter((option) => option.toLowerCase().includes(needle)).slice(0, 180);
  }, [baseSummary, titleInput]);

  const filteredWeekly = useMemo(() => {
    const base = filterBySearch(filterByContentType(weeklyData, contentType), titleInput, ["title", "seasonTitle"]);
    return filterWeeklyByYearMonth(base, yearFilter, monthFilter);
  }, [weeklyData, contentType, titleInput, yearFilter, monthFilter]);

  const filteredSummary = useMemo(() => {
    const base = filterBySearch(filterByContentType(titleSummary, contentType), titleInput, ["title", "seasonTitle", "displayTitle"]);
    if (yearFilter === "all" && monthFilter === "all") return base;
    const validTitles = new Set(filteredWeekly.map((row) => row.title));
    return base.filter((row) => validTitles.has(row.title));
  }, [titleSummary, contentType, titleInput, yearFilter, monthFilter, filteredWeekly]);

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

  const stats = getOverviewStats(filteredWeekly, filteredSummary);

  const trendData = useMemo(() => getWeeklyTrendByCategory(filteredWeekly, metric), [filteredWeekly, metric]);
  const topTitles = useMemo(
    () => getTopTitles(filteredSummary, metric === "views" ? "totalViews" : "totalHours", 10),
    [filteredSummary, metric]
  );
  const categoryPie = useMemo(
    () => getCategoryShare(filteredSummary, metric === "views" ? "totalViews" : "totalHours"),
    [filteredSummary, metric]
  );

  const numberFormat = d3.format(",");

  if (loading) {
    return <div className="page"><div className="loading">Loading dashboard…</div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Behind the Top 10</h1>
        <p>Comprehensive Netflix performance analysis across categories, time, and title lifecycle.</p>
      </div>

      <div className="controls-row">
        <label className="control-label">
          Content Type
          <select className="control-input" value={contentType} onChange={(e) => setContentType(e.target.value)}>
            <option value="all">All</option>
            <option value="movies">Movies</option>
            <option value="shows">Shows</option>
          </select>
        </label>

        <label className="control-label combo-control-label">
          Title Filter
          <input
            type="text"
            list="overview-title-options"
            className="control-input"
            placeholder="Type or pick a title/season"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
          <datalist id="overview-title-options">
            {titleOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
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
            setContentType("all");
            setTitleInput("");
            setYearFilter("all");
            setMonthFilter("all");
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Total Titles</h3>
          <p>{numberFormat(stats.totalTitles)}</p>
        </div>

        <div className="kpi-card">
          <h3>Total Weeks</h3>
          <p>{numberFormat(stats.totalWeeks)}</p>
        </div>

        <div className="kpi-card">
          <h3>Categories</h3>
          <p>{stats.categories}</p>
        </div>

        <div className="kpi-card">
          <h3>Avg Weeks Charted</h3>
          <p>{stats.avgWeeksCharted.toFixed(2)}</p>
        </div>

        <div className="kpi-card">
          <h3>Total Views</h3>
          <p>{numberFormat(stats.totalViews)}</p>
        </div>

        <div className="kpi-card">
          <h3>Total Hours</h3>
          <p>{numberFormat(stats.totalHours)}</p>
        </div>
      </div>

      <div className="chart-card">
        <div className="card-header-row">
          <h2>Category Trend by Week</h2>
          <select value={metric} onChange={(e) => setMetric(e.target.value)} className="control-input">
            <option value="views">Views</option>
            <option value="hoursViewed">Hours Viewed</option>
          </select>
        </div>
        <MultiLineChart data={trendData} />
      </div>

      <div className="chart-card">
        <h2>{metric === "views" ? "Most-Watched Titles" : "Highest-Hour Titles"}</h2>
        <HorizontalBarChart data={topTitles} valueFormatter={formatCompactNumber} />
      </div>

      <div className="chart-card">
        <h2>{metric === "views" ? "Views Share by Category" : "Hours Share by Category"}</h2>
        <PieChart data={categoryPie} title="Category share" valueFormatter={formatCompactNumber} />
      </div>
    </div>
  );
}

export default Home;