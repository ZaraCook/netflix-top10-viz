import * as d3 from "d3";

const COLORS = {
  "Films (English)": "#ef4444",
  "Films (Non-English)": "#f59e0b",
  "TV (English)": "#3b82f6",
  "TV (Non-English)": "#10b981",
};

function ScatterPlot({ data, height = 430 }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No scatter data available.</div>;
  }

  const width = 980;
  const margin = { top: 16, right: 28, bottom: 52, left: 72 };

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.x) || 0])
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.y) || 0])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const xTicks = x.ticks(8);
  const yTicks = y.ticks(5);
  const categories = [...new Set(data.map((d) => d.category))];

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Scatter plot of title performance">
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line className="grid-line" x1={margin.left} y1={y(tick)} x2={width - margin.right} y2={y(tick)} />
            <text className="axis-text" x={margin.left - 10} y={y(tick) + 4} textAnchor="end">
              {d3.format(".2s")(tick)}
            </text>
          </g>
        ))}

        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line className="grid-line grid-line-vertical" x1={x(tick)} y1={margin.top} x2={x(tick)} y2={height - margin.bottom} />
            <text className="axis-text" x={x(tick)} y={height - margin.bottom + 20} textAnchor="middle">
              {tick}
            </text>
          </g>
        ))}

        {data.map((row) => (
          <circle
            key={`${row.label}-${row.category}`}
            cx={x(row.x)}
            cy={y(row.y)}
            r={row.r}
            fill={COLORS[row.category] || "#8b5cf6"}
            opacity="0.72"
            stroke="#0b1220"
            strokeWidth="1"
          >
            <title>{`${row.label}\nWeeks Charted: ${row.x}\nTotal Views: ${d3.format(",")(row.y)}\nPeak Rank: ${row.peakRank}`}</title>
          </circle>
        ))}

        <text x={width / 2} y={height - 10} className="axis-text" textAnchor="middle">
          Weeks Charted
        </text>
        <text transform={`translate(18, ${height / 2}) rotate(-90)`} className="axis-text" textAnchor="middle">
          Total Views
        </text>
      </svg>

      <div className="chart-legend">
        {categories.map((category) => (
          <span key={category} className="legend-item">
            <span className="legend-dot" style={{ background: COLORS[category] || "#8b5cf6" }} />
            {category}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ScatterPlot;
