import { useMemo, useState } from "react";
import * as d3 from "d3";
import useNetflixData from "../hooks/useNetflixData";
import RankChart from "../components/RankChart";
import HorizontalBarChart from "../components/HorizontalBarChart";
import MultiLineChart from "../components/MultiLineChart";
import PieChart from "../components/PieChart";
import {
  filterByContentType,
  filterWeeklyByYearMonth,
  formatCompactNumber,
  getAvailableYears,
  getSeasonComparisonData,
  getSeasonTrendData,
  getTitleRankHistory,
  normalizeTitleSummary,
} from "../utils/analytics";

function TitleExplorer() {
  const { weeklyData, titleSummary, loading } = useNetflixData();
  const [selectedTitle, setSelectedTitle] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [contentType, setContentType] = useState("all");
  const [seasonMetric, setSeasonMetric] = useState("views");
  const [selectedSeasons, setSelectedSeasons] = useState([]);
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

  const baseFilteredWeekly = useMemo(
    () =>
      filterWeeklyByYearMonth(
        filterByContentType(weeklyData, contentType),
        yearFilter,
        monthFilter
      ),
    [weeklyData, contentType, yearFilter, monthFilter]
  );

  const normalizedSummary = useMemo(() => normalizeTitleSummary(titleSummary), [titleSummary]);

  const baseSummary = useMemo(() => {
    const byType = filterByContentType(normalizedSummary, contentType);
    if (yearFilter === "all" && monthFilter === "all") return byType;
    const validTitles = new Set(baseFilteredWeekly.map((row) => row.title));
    return byType.filter((row) => validTitles.has(row.title));
  }, [normalizedSummary, contentType, yearFilter, monthFilter, baseFilteredWeekly]);

  const titleOptions = useMemo(() => {
    const uniqueTitles = [...new Set(baseSummary.map((row) => row.title).filter(Boolean))].sort();
    const needle = titleInput.trim().toLowerCase();
    if (!needle) return uniqueTitles.slice(0, 160);
    return uniqueTitles.filter((title) => title.toLowerCase().includes(needle)).slice(0, 160);
  }, [baseSummary, titleInput]);

  const selectedData = useMemo(
    () => getTitleRankHistory(baseFilteredWeekly, selectedTitle),
    [baseFilteredWeekly, selectedTitle]
  );

  const summaryLookup = useMemo(() => {
    const map = new Map();
    normalizeTitleSummary(titleSummary).forEach((row) => {
      if (!map.has(row.title)) {
        map.set(row.title, {
          title: row.title,
          category: row.category,
          peakRank: row.peakRank,
          weeksCharted: row.weeksCharted,
          totalViews: row.totalViews,
          totalHours: row.totalHours,
        });
      } else {
        const existing = map.get(row.title);
        existing.peakRank = Math.min(existing.peakRank, row.peakRank);
        existing.weeksCharted += row.weeksCharted;
        existing.totalViews += row.totalViews;
        existing.totalHours += row.totalHours;
      }
    });
    return map;
  }, [titleSummary]);

  const selectedSummary = selectedTitle ? summaryLookup.get(selectedTitle) : null;

  const seasonRows = useMemo(() => getSeasonComparisonData(titleSummary, selectedTitle), [titleSummary, selectedTitle]);

  const seasonTrend = useMemo(
    () => getSeasonTrendData(baseFilteredWeekly, selectedTitle, selectedSeasons, seasonMetric),
    [baseFilteredWeekly, selectedTitle, selectedSeasons, seasonMetric]
  );

  const seasonPieData = useMemo(
    () =>
      seasonRows.map((row) => ({
        label: row.seasonTitle,
        value: seasonMetric === "views" ? row.totalViews : row.totalHours,
      })),
    [seasonRows, seasonMetric]
  );

  const weeklyBars = useMemo(
    () =>
      selectedData
        .map((d) => ({
          label: d3.timeFormat("%b %d, %Y")(d.weekDate),
          value: d.views,
        }))
        .slice(-8)
        .reverse(),
    [selectedData]
  );

  if (loading) return <div className="page"><div className="loading">Loading title explorer…</div></div>;

  return (
    <div className="page">
      <h2>Title Explorer</h2>
      <p>Inspect rank trajectory and recent engagement for a specific title.</p>

      <div className="controls-row">
        <label className="control-label">
          Content Type
          <select className="control-input" value={contentType} onChange={(e) => {
            setContentType(e.target.value);
            setSelectedTitle("");
            setTitleInput("");
            setSelectedSeasons([]);
          }}>
            <option value="all">All</option>
            <option value="movies">Movies</option>
            <option value="shows">Shows</option>
          </select>
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
            setSelectedTitle("");
            setSelectedSeasons([]);
          }}
        >
          Clear Filters
        </button>

        <label className="control-label combo-control-label">
          Title Selector
          <input
            type="text"
            list="title-explorer-options"
            className="control-input"
            placeholder="Type or pick a title"
            value={titleInput}
            onChange={(e) => {
              const nextInput = e.target.value;
              setTitleInput(nextInput);
              const hasExact = titleOptions.includes(nextInput);
              if (hasExact) {
                setSelectedTitle(nextInput);
                const seasons = getSeasonComparisonData(titleSummary, nextInput).map((row) => row.seasonTitle);
                setSelectedSeasons(seasons);
              } else {
                setSelectedTitle("");
                setSelectedSeasons([]);
              }
            }}
          />
          <datalist id="title-explorer-options">
            {titleOptions.map((title) => (
              <option key={title} value={title} />
            ))}
          </datalist>
        </label>
      </div>

      {selectedTitle && (
        <div style={{ marginTop: "24px" }}>
          <h3>{selectedTitle}</h3>
          {selectedSummary && (
            <div className="kpi-grid" style={{ marginBottom: "20px" }}>
              <div className="kpi-card"><h3>Category</h3><p>{selectedSummary.category}</p></div>
              <div className="kpi-card"><h3>Peak Rank</h3><p>{selectedSummary.peakRank}</p></div>
              <div className="kpi-card"><h3>Weeks Charted</h3><p>{selectedSummary.weeksCharted}</p></div>
              <div className="kpi-card"><h3>Total Views</h3><p>{d3.format(",")(selectedSummary.totalViews)}</p></div>
            </div>
          )}

          <div className="chart-card">
            <h2>Rank Trend</h2>
            <RankChart data={selectedData} />
          </div>

          <div className="chart-card">
            <h2>Recent Weekly Views</h2>
            <HorizontalBarChart data={weeklyBars} valueFormatter={formatCompactNumber} />
          </div>

          {seasonRows.length > 0 && (
            <>
              <div className="chart-card">
                <div className="card-header-row">
                  <h2>Season Performance Comparison</h2>
                  <select className="control-input" value={seasonMetric} onChange={(e) => setSeasonMetric(e.target.value)}>
                    <option value="views">Views</option>
                    <option value="hoursViewed">Hours</option>
                  </select>
                </div>

                <div className="season-chip-row">
                  {seasonRows.map((season) => {
                    const active = selectedSeasons.includes(season.seasonTitle);
                    return (
                      <button
                        key={season.seasonTitle}
                        type="button"
                        className={`chip-button ${active ? "chip-active" : ""}`}
                        onClick={() => {
                          setSelectedSeasons((prev) =>
                            prev.includes(season.seasonTitle)
                              ? prev.filter((item) => item !== season.seasonTitle)
                              : [...prev, season.seasonTitle]
                          );
                        }}
                      >
                        {season.seasonTitle}
                      </button>
                    );
                  })}
                </div>

                <HorizontalBarChart
                  data={seasonRows.map((row) => ({
                    label: row.seasonTitle,
                    value: seasonMetric === "views" ? row.totalViews : row.totalHours,
                  }))}
                  valueFormatter={formatCompactNumber}
                />
              </div>

              <div className="chart-card">
                <h2>Season Share</h2>
                <PieChart data={seasonPieData} title="Season share distribution" valueFormatter={formatCompactNumber} />
              </div>

              <div className="chart-card">
                <h2>Season Trend by Week</h2>
                <MultiLineChart data={seasonTrend} seriesKey="seasonTitle" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default TitleExplorer;