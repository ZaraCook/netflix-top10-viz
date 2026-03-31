import * as d3 from "d3";

function RankChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No rank history available.</div>;
  }

  const width = 980;
  const height = 360;
  const margin = { top: 20, right: 26, bottom: 52, left: 62 };

  const parsedData = data
    .filter((d) => d.week && d.rank > 0)
    .map((d) => ({
      ...d,
      parsedWeek: new Date(d.week),
      rank: Number(d.rank),
      views: Number(d.views) || 0,
    }))
    .sort((a, b) => a.parsedWeek - b.parsedWeek);

  if (parsedData.length === 0) {
    return <div className="chart-empty">No valid rank data available.</div>;
  }

  const x = d3
    .scaleTime()
    .domain(d3.extent(parsedData, (d) => d.parsedWeek))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear().domain([10, 1]).range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d) => x(d.parsedWeek))
    .y((d) => y(d.rank));

  const xTicks = x.ticks(8);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Title rank history">
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

        <path d={line(parsedData)} fill="none" stroke="#e50914" strokeWidth="2.8" />

        {parsedData.map((point, index) => (
          <circle key={`${point.week}-${index}`} cx={x(point.parsedWeek)} cy={y(point.rank)} r="4" fill="#e50914">
            <title>{`${d3.timeFormat("%Y-%m-%d")(point.parsedWeek)}\nRank ${point.rank}\nViews ${d3.format(",")(point.views)}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

export default RankChart;