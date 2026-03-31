import { useEffect, useRef } from "react";
import * as d3 from "d3";

function RankChart({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const parsedData = data
        .filter((d) => d.week && d.rank > 0)
        .map((d) => ({
            ...d,
            parsedWeek: new Date(d.week),
            rank: Number(d.rank),
        }))
        .sort((a, b) => a.parsedWeek - b.parsedWeek);

    if (parsedData.length === 0) {
        d3.select(ref.current)
            .append("div")
            .style("padding", "16px")
            .text("No valid rank data available for this title.");
        return;
    }

    const x = d3
      .scaleTime()
      .domain(d3.extent(parsedData, (d) => d.parsedWeek))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([10, 1])
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line()
      .x((d) => x(d.parsedWeek))
      .y((d) => y(d.rank));

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg
      .append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "#E50914")
      .attr("stroke-width", 2)
      .attr("d", line);
  }, [data]);

  return <div ref={ref}></div>;
}

export default RankChart;