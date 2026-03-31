import * as d3 from "d3";

function CompareRankChart({ series = [] }) {
  const validSeries = (series || []).filter((item) => item.data && item.data.length > 0);

  if (validSeries.length === 0) {
    return <div className="chart-empty">Choose two titles/seasons to compare rank lines.</div>;
  }

  const width = 980;
  const height = 380;
  const margin = { top: 22, right: 30, bottom: 56, left: 64 };

  const allPoints = validSeries.flatMap((item) =>
    item.data.map((point) => ({
      ...point,
      seriesLabel: item.label,
      color: item.color,
      parsedWeek: point.weekDate ? new Date(point.weekDate) : new Date(point.week),
      rank: Number(point.rank),
      views: Number(point.views) || 0,
    }))
  );

  const x = d3
    .scaleTime()
    .domain(d3.extent(allPoints, (d) => d.parsedWeek))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear().domain([10, 1]).range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d) => x(d.parsedWeek))
    .y((d) => y(d.rank));

  const xTicks = x.ticks(8);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Comparison rank lines">
        {xTicks.map((tick) => (
          <g key={tick.toISOString()}>
            <line className="grid-line grid-line-vertical" x1={x(tick)} y1={margin.top} x2={x(tick)} y2={height - margin.bottom} />
            <text className="axis-text" x={x(tick)} y={height - margin.bottom + 20} textAnchor="middle">
              {d3.timeFormat("%b %y")(tick)}
            </text>
          </g>
        ))}

        {d3.range(1, 11).map((rank) => (
          <g key={`rank-${rank}`}>
            <line className="grid-line" x1={margin.left} y1={y(rank)} x2={width - margin.right} y2={y(rank)} />
            <text className="axis-text" x={margin.left - 10} y={y(rank) + 4} textAnchor="end">
              {rank}
            </text>
          </g>
        ))}

        {validSeries.map((entry) => {
          const points = entry.data
            .filter((point) => point.week && point.rank > 0)
            .map((point) => ({
              ...point,
              parsedWeek: point.weekDate ? new Date(point.weekDate) : new Date(point.week),
              rank: Number(point.rank),
              views: Number(point.views) || 0,
            }))
            .sort((a, b) => a.parsedWeek - b.parsedWeek);

          return (
            <g key={entry.label}>
              <path d={line(points)} fill="none" stroke={entry.color} strokeWidth="2.8" />
              {points.map((point, index) => (
                <circle key={`${entry.label}-${point.week}-${index}`} cx={x(point.parsedWeek)} cy={y(point.rank)} r="4" fill={entry.color}>
                  <title>{`${entry.label}\n${d3.timeFormat("%Y-%m-%d")(point.parsedWeek)}\nRank ${point.rank}\nViews ${d3.format(",")(point.views)}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>

      <div className="chart-legend">
        {validSeries.map((entry) => (
          <span key={entry.label} className="legend-item">
            <span className="legend-dot" style={{ background: entry.color }} />
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default CompareRankChart;
