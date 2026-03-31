import { useMemo, useState } from "react";
import useNetflixData from "../hooks/useNetflixData";
import RankChart from "../components/RankChart";

function TitleExplorer() {
  const { weeklyData, titleSummary, loading } = useNetflixData();
  const [selectedTitle, setSelectedTitle] = useState("");

  const titles = useMemo(() => {
    return [...new Set(titleSummary.map((d) => d.title).filter(Boolean))].sort();
  }, [titleSummary]);

  const selectedData = weeklyData.filter(
    (d) => (d.title) === selectedTitle
  );

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Title Explorer</h2>

      <select
        value={selectedTitle}
        onChange={(e) => setSelectedTitle(e.target.value)}
        style={{ padding: "8px", marginTop: "12px", minWidth: "300px" }}
      >
        <option value="">Select a title</option>
        {titles.map((title) => (
          <option key={title} value={title}>
            {title}
          </option>
        ))}
      </select>

      {selectedTitle && (
        <div style={{ marginTop: "24px" }}>
          <h3>{selectedTitle}</h3>
          <RankChart data={selectedData} />
        </div>
      )}
    </div>
  );
}

export default TitleExplorer;