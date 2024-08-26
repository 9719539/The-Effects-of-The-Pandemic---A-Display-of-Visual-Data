function graph(parentid) {
  // Example d3 script for graph
  let dataset = [24, 10, 29, 19, 8, 15, 20, 12, 9, 6, 21, 28];

  // set values
  const w = 400;
  const h = 400;
  const padding = 20;

  // create svg
  const svg = d3
    .select(`#${parentid}`)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 400 400");
  // .attr("width", w)
  // .attr("height", h);

  // set scales
  let xScale = d3
    .scaleBand()
    .domain(d3.range(dataset.length))
    .rangeRound([padding, w - padding])
    .paddingInner(0.05);

  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset)])
    .rangeRound([h - padding, padding]);

  // define x axis
  const xAxis = d3.axisBottom().scale(xScale);

  // define y axis
  const yAxis = d3.axisLeft().ticks(5).scale(yScale);

  // add x axis
  svg
    .append("g")
    .attr("class", "xaxis")
    .attr("transform", `translate(0, ${h - padding})`)
    .call(xAxis);

  // add y axis
  svg
    .append("g")
    .attr("class", "yaxis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  // add bars
  svg
    .append("g")
    .attr("class", "bars")
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", (d, i) => xScale(i)) // set x dynamically
    .attr("y", (d) => yScale(d)) // set y dynamically
    .attr("width", xScale.bandwidth()) // set width to our xScale
    .attr("height", (d) => h - padding - yScale(d))
    .attr("fill", "#eab308"); // set colour of bars
}

// Draw the graph once the DOM is fully loaded to the hardcoded id
document.addEventListener("DOMContentLoaded", function () {
  graph("graph2");
});
