import useNetflixData from "../hooks/useNetflixData";

function Home() {
  const { weeklyData, titleSummary, loading } = useNetflixData();

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  const totalTitles = titleSummary.length;
  const totalWeeks = new Set(weeklyData.map((d) => d.week)).size;
  const avgWeeks =
    titleSummary.reduce((sum, d) => sum + d.weeksCharted, 0) / titleSummary.length;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Behind the Top 10</h1>
      <p>Visualizing how Netflix titles perform over time.</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
        <div style={{ border: "1px solid #ddd", padding: "16px", width: "220px" }}>
          <h3>Total Titles</h3>
          <p>{totalTitles}</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "16px", width: "220px" }}>
          <h3>Total Weeks</h3>
          <p>{totalWeeks}</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: "16px", width: "220px" }}>
          <h3>Avg Weeks Charted</h3>
          <p>{avgWeeks.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default Home;