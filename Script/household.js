// draw the stacked horizontal bar chart of different activities by month in 2020
function drawStack(id) {
  const w = 800;
  const h = 600;
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
      .attr("class", "y-axis")
      .attr("text-anchor", "start")
      .attr("transform", `translate(${margin}, 0)`);

    // create legend at top of graph
    const legend = d3.select("#legend");
    legend
      .selectAll(".legendItem")
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

function drawBarChart(id) {
  // load data from csv
  const dir =
    "../Datasets/Stimulus payment uses for persons aged 18 years and over receiving the JobKeeper Payment(a)(b).csv";
  d3.csv(dir).then((data) => {
    const dataMap = Object.entries(data[0]).map(([key, value]) => ({
      key: key.slice(0, -3), // slice the last 3 characters from the string to remove (%)
      value: +value,
    }));
    // remove first entry from map as it's not useful for our chart
    const mappedData = [...dataMap].filter((_, index) => index !== 0);
    console.log(mappedData);

    // use this to have extra space under the graph to draw our labels
    const labelPadding = 100;
    // set values
    const w = 800;
    const h = 500 + labelPadding;
    const padding = 25;

    // create svg
    const svg = d3
      .select(`#${id}`)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", [0, 0, w, h]);
    // use viewbox and preserve aspect ratio to allow for more responsive chart sizes
    // this means we do not need to hardcode a width or height attribute to our charts

    // sort data
    mappedData.sort(function (b, a) {
      return a.value - b.value;
    });

    // create scales
    const xScale = d3
      .scaleBand()
      .range([0, w - padding])
      .domain(mappedData.map((d) => d.key))
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([h - padding - labelPadding, padding]);

    svg
      .append("g")
      .attr("transform", `translate(${padding}, ${-0})`)
      .call(d3.axisLeft(yScale));

    // add bars
    svg
      .append("g")
      .attr("class", "bars")
      .selectAll("rect")
      .data(mappedData)
      .enter()
      .append("rect")
      .attr("transform", `translate(0,-${labelPadding})`)
      .attr("x", (d, i) => xScale(d.key) + padding) // set x dynamically
      .attr("y", (d) => yScale(d.value) + labelPadding) // set y dynamically
      .attr("width", xScale.bandwidth()) // set width to our xScale
      .attr("height", (d) => h - padding - labelPadding - yScale(d.value))
      .attr("fill", (d, i) => d3.schemeCategory10[i]) // set colour of bars
      .append("title") // create tooltip when hovered
      .text((d) => `${d.key} \n${d.value}%`);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(${padding}, ${h - padding - labelPadding})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("class", "smllabel")
      .attr("transform", "translate(-10,0)rotate(-25)")
      // .attr("transform", "translate(-10,-5)rotate(-90)")
      .style("text-anchor", "end");
  });
}

// Draw the graph once the DOM is fully loaded to the hardcoded id
document.addEventListener("DOMContentLoaded", function () {
  drawStack("graph1");
  drawBarChart("graph2");
});
