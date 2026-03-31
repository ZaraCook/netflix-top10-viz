import * as d3 from "d3";

export function formatCompactNumber(value) {
  const absolute = Math.abs(Number(value) || 0);
  if (absolute >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (absolute >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${Math.round(value || 0)}`;
}

export function getContentType(category = "") {
  if (category.includes("Films")) return "movies";
  if (category.includes("TV")) return "shows";
  return "other";
}

export function filterByContentType(rows, contentType = "all") {
  if (!rows || contentType === "all") return rows || [];
  return rows.filter((row) => getContentType(row.category || "") === contentType);
}

export function filterBySearch(rows, searchTerm = "", field = "title") {
  if (!rows || !searchTerm.trim()) return rows || [];
  const needle = searchTerm.trim().toLowerCase();
  const fields = Array.isArray(field) ? field : [field];
  return rows.filter((row) =>
    fields.some((fieldName) => String(row[fieldName] || "").toLowerCase().includes(needle))
  );
}

export function getAvailableYears(weeklyRows = []) {
  return [...new Set((weeklyRows || []).map((row) => new Date(row.week).getFullYear()))]
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => b - a);
}

export function filterWeeklyByYearMonth(rows, year = "all", month = "all") {
  return (rows || []).filter((row) => {
    const date = new Date(row.week);
    if (Number.isNaN(date.getTime())) return false;
    const rowYear = date.getFullYear();
    const rowMonth = date.getMonth() + 1;
    const yearMatch = year === "all" || Number(year) === rowYear;
    const monthMatch = month === "all" || Number(month) === rowMonth;
    return yearMatch && monthMatch;
  });
}

export function normalizeWeeklyData(weeklyData) {
  return (weeklyData || [])
    .filter((row) => row.week && row.title)
    .map((row) => ({
      ...row,
      weekDate: new Date(row.week),
      rank: Number(row.rank) || 0,
      views: Number(row.views) || 0,
      hoursViewed: Number(row.hoursViewed) || 0,
      weeksInTop10: Number(row.weeksInTop10) || 0,
      runtime: Number(row.runtime) || 0,
    }))
    .sort((a, b) => a.weekDate - b.weekDate);
}

export function normalizeTitleSummary(summaryData) {
  return (summaryData || []).map((row) => ({
    ...row,
    displayTitle: row.displayTitle || (row.seasonTitle && row.seasonTitle !== "N/A" ? row.seasonTitle : row.title),
    peakRank: Number(row.peakRank) || 10,
    weeksCharted: Number(row.weeksCharted) || 0,
    totalViews: Number(row.totalViews) || 0,
    totalHours: Number(row.totalHours) || 0,
    firstWeekDate: row.firstWeek ? new Date(row.firstWeek) : null,
    lastWeekDate: row.lastWeek ? new Date(row.lastWeek) : null,
  }));
}

export function getOverviewStats(weeklyData, titleSummary) {
  const normalizedWeekly = normalizeWeeklyData(weeklyData);
  const normalizedSummary = normalizeTitleSummary(titleSummary);
  const uniqueWeeks = new Set(normalizedWeekly.map((d) => d.week)).size;
  const categories = [...new Set(normalizedSummary.map((d) => d.category))].filter(Boolean);

  return {
    totalTitles: normalizedSummary.length,
    totalWeeks: uniqueWeeks,
    categories: categories.length,
    avgWeeksCharted:
      normalizedSummary.length > 0
        ? d3.mean(normalizedSummary, (d) => d.weeksCharted) || 0
        : 0,
    totalViews: d3.sum(normalizedSummary, (d) => d.totalViews),
    totalHours: d3.sum(normalizedSummary, (d) => d.totalHours),
  };
}

export function getCategoryShare(summaryData, metric = "totalViews") {
  const normalizedSummary = normalizeTitleSummary(summaryData);
  return d3
    .rollups(
      normalizedSummary,
      (rows) => d3.sum(rows, (d) => d[metric] || 0),
      (d) => d.category
    )
    .map(([label, value]) => ({ label, value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function getWeeklyTrendByCategory(weeklyData, metric = "views") {
  const normalizedWeekly = normalizeWeeklyData(weeklyData);
  const rollup = d3.rollups(
    normalizedWeekly,
    (rows) => d3.sum(rows, (d) => d[metric] || 0),
    (d) => d.week,
    (d) => d.category
  );

  return rollup
    .flatMap(([week, byCategory]) =>
      byCategory.map(([category, value]) => ({
        week,
        weekDate: new Date(week),
        category,
        value,
      }))
    )
    .sort((a, b) => a.weekDate - b.weekDate);
}

export function getTopTitles(summaryData, metric = "totalViews", limit = 12) {
  const normalizedSummary = normalizeTitleSummary(summaryData);
  return [...normalizedSummary]
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    .slice(0, limit)
    .map((d) => ({
      label: d.displayTitle,
      value: d[metric] || 0,
      category: d.category,
      peakRank: d.peakRank,
      weeksCharted: d.weeksCharted,
    }));
}

export function getRankDistribution(weeklyData) {
  const normalizedWeekly = normalizeWeeklyData(weeklyData);
  const bins = d3.rollups(
    normalizedWeekly,
    (rows) => rows.length,
    (d) => d.category,
    (d) => d.rank
  );

  return bins.flatMap(([category, ranks]) =>
    ranks.map(([rank, count]) => ({
      category,
      rank,
      count,
    }))
  );
}

export function getScatterDataset(summaryData) {
  const normalizedSummary = normalizeTitleSummary(summaryData);
  return normalizedSummary
    .filter((d) => d.totalViews > 0 && d.weeksCharted > 0)
    .map((d) => ({
      x: d.weeksCharted,
      y: d.totalViews,
      r: Math.max(4, 14 - d.peakRank),
      label: d.title,
      category: d.category,
      peakRank: d.peakRank,
      totalHours: d.totalHours,
    }));
}

export function getTitleRankHistory(weeklyData, title, seasonTitle = null) {
  return normalizeWeeklyData(weeklyData)
    .filter(
      (d) =>
        d.title === title &&
        d.rank > 0 &&
        (!seasonTitle || seasonTitle === "N/A" || d.seasonTitle === seasonTitle)
    )
    .map((d) => ({
      week: d.week,
      weekDate: d.weekDate,
      rank: d.rank,
      views: d.views,
      hoursViewed: d.hoursViewed,
      category: d.category,
      seasonTitle: d.seasonTitle,
    }))
    .sort((a, b) => a.weekDate - b.weekDate);
}

export function getTopVolatileTitles(summaryData, limit = 10) {
  const normalizedSummary = normalizeTitleSummary(summaryData);
  return [...normalizedSummary]
    .filter((d) => d.weeksCharted >= 3)
    .sort((a, b) => (a.peakRank - 1) / a.weeksCharted - (b.peakRank - 1) / b.weeksCharted)
    .slice(0, limit)
    .map((d) => ({
      label: d.displayTitle,
      value: d.weeksCharted,
      category: d.category,
      score: (d.peakRank - 1) / Math.max(1, d.weeksCharted),
    }));
}

export function getCategoryAverageWeeks(summaryData) {
  const normalizedSummary = normalizeTitleSummary(summaryData);
  return d3
    .rollups(
      normalizedSummary,
      (rows) => d3.mean(rows, (d) => d.weeksCharted) || 0,
      (d) => d.category
    )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function getTopNumberOneStreaks(summaryData, limit = 12) {
  const normalizedSummary = normalizeTitleSummary(summaryData);
  return [...normalizedSummary]
    .filter((d) => d.peakRank === 1)
    .sort((a, b) => b.weeksCharted - a.weeksCharted)
    .slice(0, limit)
    .map((d) => ({
      label: d.displayTitle,
      value: d.weeksCharted,
      category: d.category,
      totalViews: d.totalViews,
    }));
}

export function getNumberOneCategoryShare(summaryData) {
  const normalizedSummary = normalizeTitleSummary(summaryData);
  return d3
    .rollups(
      normalizedSummary.filter((d) => d.peakRank === 1),
      (rows) => d3.sum(rows, (d) => d.weeksCharted),
      (d) => d.category
    )
    .map(([label, value]) => ({ label, value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function getWeeklyNumberOneTrend(weeklyData, metric = "views") {
  const normalizedWeekly = normalizeWeeklyData(weeklyData);
  return d3
    .rollups(
      normalizedWeekly.filter((d) => d.rank === 1),
      (rows) => d3.sum(rows, (d) => d[metric] || 0),
      (d) => d.week,
      (d) => d.category
    )
    .flatMap(([week, categoryRows]) =>
      categoryRows.map(([category, value]) => ({
        week,
        weekDate: new Date(week),
        category,
        value,
      }))
    )
    .sort((a, b) => a.weekDate - b.weekDate);
}

export function getSeasonComparisonData(summaryData, title) {
  if (!title) return [];
  const normalizedSummary = normalizeTitleSummary(summaryData);
  return normalizedSummary
    .filter((d) => d.title === title && d.seasonTitle && d.seasonTitle !== "N/A")
    .sort((a, b) => (a.seasonTitle || "").localeCompare(b.seasonTitle || ""))
    .map((d) => ({
      seasonTitle: d.seasonTitle,
      totalViews: d.totalViews,
      totalHours: d.totalHours,
      weeksCharted: d.weeksCharted,
      peakRank: d.peakRank,
      category: d.category,
    }));
}

export function getSeasonTrendData(weeklyData, title, selectedSeasons = [], metric = "views") {
  if (!title) return [];
  const normalizedWeekly = normalizeWeeklyData(weeklyData);
  const rows = normalizedWeekly.filter(
    (d) =>
      d.title === title &&
      d.seasonTitle &&
      d.seasonTitle !== "N/A" &&
      (selectedSeasons.length === 0 || selectedSeasons.includes(d.seasonTitle))
  );

  return d3
    .rollups(
      rows,
      (groupRows) => d3.sum(groupRows, (d) => d[metric] || 0),
      (d) => d.week,
      (d) => d.seasonTitle
    )
    .flatMap(([week, seasonRows]) =>
      seasonRows.map(([seasonTitle, value]) => ({
        week,
        weekDate: new Date(week),
        seasonTitle,
        value,
      }))
    )
    .sort((a, b) => a.weekDate - b.weekDate);
}
