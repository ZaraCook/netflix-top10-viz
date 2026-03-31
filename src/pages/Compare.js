import { useMemo, useState } from "react";
import useNetflixData from "../hooks/useNetflixData";
import CompareRankChart from "../components/CompareRankChart";
import HorizontalBarChart from "../components/HorizontalBarChart";
import PieChart from "../components/PieChart";
import {
  filterByContentType,
  filterWeeklyByYearMonth,
  formatCompactNumber,
  getAvailableYears,
  getTitleRankHistory,
  normalizeTitleSummary,
} from "../utils/analytics";

function Compare() {
  const { weeklyData, titleSummary, loading } = useNetflixData();
  const [leftSelection, setLeftSelection] = useState("");
  const [rightSelection, setRightSelection] = useState("");
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [contentType, setContentType] = useState("all");
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
        filterByContentType(weeklyData, contentType),
        yearFilter,
        monthFilter
      ),
    [weeklyData, contentType, yearFilter, monthFilter]
  );

  const filteredSummary = useMemo(
    () => {
      const base = filterByContentType(titleSummary, contentType);
      if (yearFilter === "all" && monthFilter === "all") return base;
      const validTitles = new Set(filteredWeekly.map((row) => row.title));
      return base.filter((row) => validTitles.has(row.title));
    },
    [titleSummary, contentType, yearFilter, monthFilter, filteredWeekly]
  );

  const summaryOptions = useMemo(() => {
    const normalized = normalizeTitleSummary(filteredSummary);
    const entries = normalized.map((item) => {
      const seasonValue = item.seasonTitle && item.seasonTitle !== "" ? item.seasonTitle : "N/A";
      const value = `${item.title}||${seasonValue}`;
      const label = item.displayTitle || item.title;
      const inputLabel = `${label} (${item.category})`;
      return { value, label, inputLabel };
    });

    const map = new Map();
    entries.forEach((entry) => {
      if (!map.has(entry.value)) {
        map.set(entry.value, entry);
      }
    });

    return [...map.values()].sort((a, b) => a.inputLabel.localeCompare(b.inputLabel));
  }, [filteredSummary]);

  const optionLookup = useMemo(() => {
    const map = new Map();
    summaryOptions.forEach((option) => {
      map.set(option.inputLabel, option.value);
    });
    return map;
  }, [summaryOptions]);

  const leftOptions = useMemo(() => {
    const needle = leftInput.trim().toLowerCase();
    if (!needle) return summaryOptions.slice(0, 120);
    return summaryOptions
      .filter((option) => option.inputLabel.toLowerCase().includes(needle))
      .slice(0, 120);
  }, [summaryOptions, leftInput]);

  const rightOptions = useMemo(() => {
    const needle = rightInput.trim().toLowerCase();
    if (!needle) return summaryOptions.slice(0, 120);
    return summaryOptions
      .filter((option) => option.inputLabel.toLowerCase().includes(needle))
      .slice(0, 120);
  }, [summaryOptions, rightInput]);

  const summaryMap = useMemo(() => {
    const map = new Map();
    normalizeTitleSummary(filteredSummary).forEach((item) => {
      const seasonValue = item.seasonTitle && item.seasonTitle !== "" ? item.seasonTitle : "N/A";
      map.set(`${item.title}||${seasonValue}`, item);
    });
    return map;
  }, [filteredSummary]);

  const getSelectionParts = (selection) => {
    if (!selection) return { title: "", seasonTitle: null };
    const [title, seasonTitle] = selection.split("||");
    return {
      title,
      seasonTitle: seasonTitle && seasonTitle !== "N/A" ? seasonTitle : null,
    };
  };

  const leftParts = getSelectionParts(leftSelection);
  const rightParts = getSelectionParts(rightSelection);

  const leftData = useMemo(
    () => getTitleRankHistory(filteredWeekly, leftParts.title, leftParts.seasonTitle),
    [filteredWeekly, leftParts.title, leftParts.seasonTitle]
  );
  const rightData = useMemo(
    () => getTitleRankHistory(filteredWeekly, rightParts.title, rightParts.seasonTitle),
    [filteredWeekly, rightParts.title, rightParts.seasonTitle]
  );

  const comparisonLines = useMemo(() => {
    const leftLabel = summaryMap.get(leftSelection)?.displayTitle;
    const rightLabel = summaryMap.get(rightSelection)?.displayTitle;
    const lines = [];
    if (leftSelection && leftData.length > 0) {
      lines.push({ label: leftLabel || "Selection A", color: "#e50914", data: leftData });
    }
    if (rightSelection && rightData.length > 0) {
      lines.push({ label: rightLabel || "Selection B", color: "#3b82f6", data: rightData });
    }
    return lines;
  }, [leftSelection, rightSelection, leftData, rightData, summaryMap]);

  const comparisonBars = useMemo(() => {
    const left = summaryMap.get(leftSelection);
    const right = summaryMap.get(rightSelection);
    if (!left || !right) return [];
    return [
      { label: `${left.displayTitle} (Views)`, value: left.totalViews },
      { label: `${right.displayTitle} (Views)`, value: right.totalViews },
      { label: `${left.displayTitle} (Hours)`, value: left.totalHours },
      { label: `${right.displayTitle} (Hours)`, value: right.totalHours },
      { label: `${left.displayTitle} (Weeks)`, value: left.weeksCharted },
      { label: `${right.displayTitle} (Weeks)`, value: right.weeksCharted },
    ];
  }, [leftSelection, rightSelection, summaryMap]);

  const comparisonPie = useMemo(() => {
    const left = summaryMap.get(leftSelection);
    const right = summaryMap.get(rightSelection);
    if (!left || !right) return [];

    return [
      { label: left.displayTitle, value: left.totalViews || 0 },
      { label: right.displayTitle, value: right.totalViews || 0 },
    ];
  }, [leftSelection, rightSelection, summaryMap]);

  if (loading) return <div className="page"><div className="loading">Loading comparison workspace…</div></div>;

  return (
    <div className="page">
      <h2>Compare Titles</h2>
      <p>Select two titles to compare trajectory and engagement side by side.</p>

      <div className="controls-row">
        <label className="control-label">
          Content Type
          <select className="control-input" value={contentType} onChange={(e) => {
            setContentType(e.target.value);
            setLeftSelection("");
            setRightSelection("");
            setLeftInput("");
            setRightInput("");
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
            setYearFilter("all");
            setMonthFilter("all");
            setLeftSelection("");
            setRightSelection("");
            setLeftInput("");
            setRightInput("");
          }}
        >
          Clear Filters
        </button>

        <div className="compare-selectors-row">
          <label className="control-label compare-control-label">
            Selection A
            <input
              type="text"
              list="left-compare-options"
              className="control-input"
              placeholder="Type or pick title/season"
              value={leftInput}
              onChange={(e) => {
                const typed = e.target.value;
                setLeftInput(typed);
                const selectedValue = optionLookup.get(typed);
                setLeftSelection(selectedValue || "");
              }}
            />
            <datalist id="left-compare-options">
              {leftOptions.map((option) => (
                <option key={`left-${option.value}`} value={option.inputLabel} />
              ))}
            </datalist>
          </label>

          <label className="control-label compare-control-label">
            Selection B
            <input
              type="text"
              list="right-compare-options"
              className="control-input"
              placeholder="Type or pick title/season"
              value={rightInput}
              onChange={(e) => {
                const typed = e.target.value;
                setRightInput(typed);
                const selectedValue = optionLookup.get(typed);
                setRightSelection(selectedValue || "");
              }}
            />
            <datalist id="right-compare-options">
              {rightOptions.map((option) => (
                <option key={`right-${option.value}`} value={option.inputLabel} />
              ))}
            </datalist>
          </label>
        </div>
      </div>

      <div className="chart-card">
        <h3>Rank Trends on One Timeline</h3>
        <CompareRankChart series={comparisonLines} />
      </div>

      <div className="chart-card">
        <h3>Side-by-Side Performance</h3>
        <HorizontalBarChart data={comparisonBars} valueFormatter={formatCompactNumber} />
      </div>

      <div className="chart-card">
        <h3>View Share Split</h3>
        <PieChart data={comparisonPie} title="Two-title view share" valueFormatter={formatCompactNumber} />
      </div>
    </div>
  );
}

export default Compare;