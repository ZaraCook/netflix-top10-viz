import * as d3 from "d3";

function HorizontalBarChart({ data, height = 420, valueFormatter = d3.format(",") }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No bar chart data available.</div>;
  }

  const width = 980;
  const margin = { top: 16, right: 28, bottom: 24, left: 280 };
  const innerHeight = height - margin.top - margin.bottom;

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) || 0])
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.label))
    .range([margin.top, margin.top + innerHeight])
    .padding(0.22);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Horizontal bar chart">
        {data.map((row) => (
          <g key={row.label}>
            <text x={margin.left - 10} y={y(row.label) + y.bandwidth() / 2 + 4} textAnchor="end" className="axis-text">
              {row.label}
            </text>
            <rect x={margin.left} y={y(row.label)} width={x(row.value) - margin.left} height={y.bandwidth()} rx="6" fill="#e50914">
              <title>{`${row.label}\n${valueFormatter(row.value)}`}</title>
            </rect>
            <text
              x={x(row.value) > width - margin.right - 74 ? x(row.value) - 8 : x(row.value) + 8}
              y={y(row.label) + y.bandwidth() / 2 + 4}
              className="axis-text"
              textAnchor={x(row.value) > width - margin.right - 74 ? "end" : "start"}
            >
              {valueFormatter(row.value)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default HorizontalBarChart;
