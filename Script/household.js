// draw the stacked horizontal bar chart of different activities by month in 2020
function drawStack(id) {
  const w = 400;
  const h = 400;
  margin = 20;

  // load data from csv
  const dir =
    "../Datasets/Persons in Victoria aged 18 years and over, participation in selected activities one or more times a week in the last four weeks, September, October and December 2020.csv";
  d3.csv(dir).then((data) => {
    const transformedData = data.map((d) => ({
      activity:
        d[
          "Persons in Victoria aged 18 years and over, participation in selected activities one or more times a week in the last four weeks, September, October and December 2020"
        ],
      "Dec-20": parseFloat(d["Dec-20 (%)"]),
      "Oct-20": parseFloat(d["Oct-20 (%)"]),
      "Sep-20": parseFloat(d["Sep-20 (%)"]),
    }));
    // transform data into d3 stacks with keys for each column
    const stack = d3.stack().keys(["Dec-20", "Oct-20", "Sep-20"]);
    const stackedData = stack(transformedData);

    const svg = d3
      .select(`#${id}`)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", [0, 0, w, h]);

    // Create y scale for bar height
    const yScale = d3
      .scaleBand()
      .domain(transformedData.map((d) => d.activity))
      .range([0, h - margin])
      .padding(0.1);

    // create x scale for bars
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(stackedData, (d) => d3.max(d, (d) => d[1]))])
      .range([0, w]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // use to get the percentage of individual parts from the stackedData
    const percentage = (d) => {
      return (d[1] - d[0]).toFixed(1);
    };

    // create stacked bars
    svg
      .selectAll(".layer")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "layer")
      .attr("fill", (d, i) => color(i))
      .selectAll("rect")
      .data((d) => d.map((e) => ({ key: d.key, value: e }))) // map stacked values to allow us to access the key easier for title
      .enter()
      .append("rect")
      .attr("transform", `translate(${margin}, 0)`)
      .attr("y", (d) => yScale(d.value.data.activity))
      .attr("x", (d) => xScale(d.value[0])) // start position based on the cumulative value from the stack
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => xScale(d.value[1]) - xScale(d.value[0])) // width based on the stacked value
      .append("title") // create tooltip when hovered
      .text(
        (d) => `${d.value.data.activity} \n${d.key}: ${percentage(d.value)}%`
      );

    // add y-axis with labels
    svg
      .append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "y axis")
      .attr("text-anchor", "start")
      .attr("transform", `translate(${margin}, 0)`);

    // create legend at top of graph
    const legend = d3.select("#legend");
    legend
      .selectAll(".legendtem")
      .data(stackedData)
      .enter()
      .append("div")
      .attr("class", "legendItem")
      .html(
        // create a box for each colour to display our legend
        (d) => `
          <div style="width: 1.5rem; height: 1.5rem; margin-right: 0.5rem; background: ${color(
            stackedData.indexOf(d)
          )};"></div>
      <span>${d.key}</span>`
      );
  });
}

// Draw the graph once the DOM is fully loaded to the hardcoded id
document.addEventListener("DOMContentLoaded", function () {
  drawStack("graph1");
});
