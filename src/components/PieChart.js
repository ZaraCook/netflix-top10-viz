import * as d3 from "d3";

const COLORS = ["#e50914", "#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function PieChart({ data, height = 380, valueFormatter = d3.format(".2s"), title = "Distribution" }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No pie chart data available.</div>;
  }

  const width = 980;
  const radius = Math.min(width, height) / 3.3;
  const centerX = width * 0.32;
  const centerY = height / 2;

  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.label))
    .range(COLORS);

  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null);

  const arc = d3.arc().innerRadius(radius * 0.52).outerRadius(radius);
  const arcs = pie(data);
  const total = d3.sum(data, (d) => d.value);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label={title}>
        <g transform={`translate(${centerX}, ${centerY})`}>
          {arcs.map((segment, index) => (
            <path key={segment.data.label} d={arc(segment)} fill={color(segment.data.label)} stroke="#0b1220" strokeWidth="1.5">
              <title>
                {`${segment.data.label}\n${valueFormatter(segment.data.value)} (${((segment.data.value / total) * 100).toFixed(1)}%)`}
              </title>
            </path>
          ))}
          <text textAnchor="middle" className="axis-text" y="-4">
            Total
          </text>
          <text textAnchor="middle" className="axis-text" y="16" style={{ fontSize: 16, fill: "#ffffff", fontWeight: 700 }}>
            {valueFormatter(total)}
          </text>
        </g>

        <g transform={`translate(${width * 0.58}, 50)`}>
          {data.map((item, index) => (
            <g key={`legend-${item.label}`} transform={`translate(0, ${index * 24})`}>
              <rect width="12" height="12" rx="4" fill={color(item.label)} />
              <text x="18" y="10" className="axis-text">
                {item.label} • {valueFormatter(item.value)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default PieChart;
