import * as d3 from "d3";

const COLORS = ["#e50914", "#2563eb", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

function MultiLineChart({ data, xKey = "weekDate", yKey = "value", seriesKey = "category", height = 360 }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No trend data available.</div>;
  }

  const width = 980;
  const margin = { top: 20, right: 24, bottom: 56, left: 70 };

  const seriesNames = [...new Set(data.map((d) => d[seriesKey]))].filter(Boolean);
  const color = d3.scaleOrdinal().domain(seriesNames).range(COLORS);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d[xKey]))
    .range([margin.left, width - margin.right]);

  const yMax = d3.max(data, (d) => d[yKey]) || 0;
  const y = d3
    .scaleLinear()
    .domain([0, yMax])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const grouped = d3.group(data, (d) => d[seriesKey]);
  const line = d3
    .line()
    .x((d) => x(d[xKey]))
    .y((d) => y(d[yKey]));

  const xTicks = x.ticks(8);
  const yTicks = y.ticks(5);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Multi-line trend chart">
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={margin.left} y1={y(tick)} x2={width - margin.right} y2={y(tick)} className="grid-line" />
            <text x={margin.left - 10} y={y(tick) + 4} textAnchor="end" className="axis-text">
              {d3.format(".2s")(tick)}
            </text>
          </g>
        ))}

        {xTicks.map((tick) => (
          <g key={`x-${tick.toISOString()}`}>
            <line x1={x(tick)} y1={margin.top} x2={x(tick)} y2={height - margin.bottom} className="grid-line grid-line-vertical" />
            <text x={x(tick)} y={height - margin.bottom + 20} textAnchor="middle" className="axis-text">
              {d3.timeFormat("%b %y")(tick)}
            </text>
          </g>
        ))}

        {[...grouped.entries()].map(([series, rows]) => (
          <g key={series}>
            <path d={line(rows)} fill="none" stroke={color(series)} strokeWidth="2.5" />
            {rows.map((row, idx) => (
              <circle key={`${series}-${idx}`} cx={x(row[xKey])} cy={y(row[yKey])} r="3.2" fill={color(series)}>
                <title>{`${series}\n${d3.timeFormat("%Y-%m-%d")(row[xKey])}\n${d3.format(",")(row[yKey])}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>

      <div className="chart-legend">
        {seriesNames.map((series) => (
          <span key={series} className="legend-item">
            <span className="legend-dot" style={{ background: color(series) }} />
            {series}
          </span>
        ))}
      </div>
    </div>
  );
}

export default MultiLineChart;
