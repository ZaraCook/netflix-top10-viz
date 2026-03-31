import * as d3 from "d3";

function HeatmapChart({ data, height = 420 }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No heatmap data available.</div>;
  }

  const width = 980;
  const margin = { top: 24, right: 24, bottom: 54, left: 180 };

  const categories = [...new Set(data.map((d) => d.category))];
  const ranks = [...new Set(data.map((d) => d.rank))].sort((a, b) => a - b);

  const x = d3
    .scaleBand()
    .domain(ranks)
    .range([margin.left, width - margin.right])
    .padding(0.05);

  const y = d3
    .scaleBand()
    .domain(categories)
    .range([margin.top, height - margin.bottom])
    .padding(0.08);

  const maxCount = d3.max(data, (d) => d.count) || 1;
  const color = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxCount]);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Rank distribution heatmap">
        {categories.map((category) => (
          <text key={category} x={margin.left - 10} y={y(category) + y.bandwidth() / 2 + 4} textAnchor="end" className="axis-text">
            {category}
          </text>
        ))}

        {ranks.map((rank) => (
          <text key={rank} x={x(rank) + x.bandwidth() / 2} y={height - margin.bottom + 20} textAnchor="middle" className="axis-text">
            {rank}
          </text>
        ))}

        {data.map((cell) => (
          <rect
            key={`${cell.category}-${cell.rank}`}
            x={x(cell.rank)}
            y={y(cell.category)}
            width={x.bandwidth()}
            height={y.bandwidth()}
            fill={color(cell.count)}
            rx="4"
          >
            <title>{`${cell.category}\nRank ${cell.rank}\nEntries: ${cell.count}`}</title>
          </rect>
        ))}
      </svg>
    </div>
  );
}

export default HeatmapChart;
