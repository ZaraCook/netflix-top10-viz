import { useEffect, useState } from "react";

function useNetflixData() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [titleSummary, setTitleSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const basePath = process.env.PUBLIC_URL || "";
        console.log("Loading data from basePath:", basePath);
        
        const [weeklyRes, summaryRes] = await Promise.all([
          fetch(`${basePath}/data/weekly_top10.json`),
          fetch(`${basePath}/data/title_summary.json`),
        ]);

        if (!weeklyRes.ok) {
          throw new Error(`Failed to fetch weekly_top10.json: ${weeklyRes.status} ${weeklyRes.statusText}`);
        }
        if (!summaryRes.ok) {
          throw new Error(`Failed to fetch title_summary.json: ${summaryRes.status} ${summaryRes.statusText}`);
        }

        const weekly = await weeklyRes.json();
        const summary = await summaryRes.json();

        console.log("Data loaded successfully:", { weeklyCount: weekly.length, summaryCount: summary.length });
        setWeeklyData(weekly);
        setTitleSummary(summary);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { weeklyData, titleSummary, loading };
}

export default useNetflixData;