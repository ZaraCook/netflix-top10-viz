import { useEffect, useState } from "react";

function useNetflixData() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [titleSummary, setTitleSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [weeklyRes, summaryRes] = await Promise.all([
          fetch("/data/weekly_top10.json"),
          fetch("/data/title_summary.json"),
        ]);

        const weekly = await weeklyRes.json();
        const summary = await summaryRes.json();

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