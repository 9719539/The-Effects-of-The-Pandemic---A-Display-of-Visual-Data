function calcPercentChange(entries) {
  // Calculate percentage change and include it in entries
  entries.forEach((entry, index) => {
    // first index isn't using previous year
    if (index === 0) {
      entry.change = 0;
    } else {
      const previousValue = entries[index - 1].value;
      const currentValue = entry.value;
      // get percentage of change
      entry.change = ((currentValue - previousValue) / previousValue) * 100;
    }
  });
  // remove first index as we don't need 2017 data
  entries.shift();
  return entries;
}

// draw the area chart showing change in GDP by year from 2018-2020 for AUS, USA, GBR, CHN, NZL, ITA
function drawLineChart(id) {
  const margin = { top: 10, right: 30, bottom: 30, left: 60 };
  const w = 800 - margin.left - margin.right;
  const h = 600 - margin.top - margin.bottom;

  const countries = ["AUS", "USA", "GBR", "CHN", "NZL", "ITA"]; // Country codes

  // load data from csv
  const dir = "./Datasets/HEALTH_ECOR-2022-1-EN-20230430T100058.csv";
  d3.csv(dir).then((data) => {
    // filter only GDP data for specified countries within the year range
    const gdpData = data.filter(
      (d) =>
        d.Variable === "Gross domestic product (GDP)" &&
        d.Measure === "Million US$ at exchange rate" &&
        // d.Measure === "/capita, US$ exchange rate" && // per capita data
        // d.Measure === "Price index (2015=100)" && // data scaled with 2015 dollar value with inflation accounted for
        countries.includes(d.COU) &&
        d.Year >= 2017 &&
        d.Year <= 2020
    );
    //map data to make more easily readable
    const mappedData = d3
      .groups(gdpData, (d) => d.COU)
      .map(([key, values]) => {
        const data = values.map((d) => ({ year: d.Year, value: +d.Value }));
        const entries = calcPercentChange(data);
        return {
          country: key,
          entries: entries,
        };
      });

    const svg = d3
      .select(`#${id}`)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", [0, 0, w, h]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare the data
    const years = mappedData[0].entries.map((d) => d.year);

    // Define scales
    const xScale = d3
      .scalePoint()
      .domain(years)
      .range([0, w - margin.left - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(mappedData, (d) => d3.min(d.entries, (e) => e.change)),
        d3.max(mappedData, (d) => d3.max(d.entries, (e) => e.change)),
      ])
      .nice()
      .range([h, 0]);

    // Define line generator
    const line = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.value));

    // Draw axes
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${h - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", `translate(0,${-margin.bottom})`)
      .call(d3.axisLeft(yScale).tickFormat((d) => d + "%"));

    // Draw lines for each country
    mappedData.forEach((countryData, i) => {
      g.append("path")
        .datum(
          countryData.entries.map((entry) => ({
            year: entry.year,
            value: entry.change,
          }))
        )
        .attr("class", "line")
        .attr("transform", `translate(0,${-margin.bottom})`)
        .attr("d", line)
        .style("stroke", d3.schemeCategory10[i]) // Use D3 color scheme for different colors
        .attr("fill", "none");

      // create legend at top of graph
      const legend = d3.select("#legend");
      legend
        .selectAll(".legendItem")
        .data(mappedData)
        .enter()
        .append("div")
        .attr("class", "legendItem")
        .html(
          // create a box for each colour to display our legend
          (
            d,
            i
          ) => `<div style="width: 1.5rem; height: 1.5rem; margin-right: 0.5rem; background: ${d3.schemeCategory10[i]};"></div>
      <span>${d.country}</span>`
        );
    });
  });
}

function drawAreaChart(id) {
  const margin = { top: 10, right: 30, bottom: 30, left: 60 };
  const w = 800 - margin.left - margin.right;
  const h = 600 - margin.top - margin.bottom;

  // get just italy and australia
  const countries = ["AUS", "ITA"]; // Country codes

  // load data from csv
  const dir = "./Datasets/HEALTH_ECOR-2022-1-EN-20230430T100058.csv";
  d3.csv(dir).then((data) => {
    // filter only GDP data for specified countries within the year range
    const gdpData = data.filter(
      (d) =>
        d.Variable === "Average annual wages" &&
        d.Measure === "Current prices in NCU" &&
        // d.Measure === "/capita, US$ exchange rate" && // per capita data
        // d.Measure === "Price index (2015=100)" && // data scaled with 2015 dollar value with inflation accounted for
        countries.includes(d.COU) &&
        d.Year >= 2017 &&
        d.Year <= 2020
    );
    //map data to make more easily readable
    const mappedData = d3
      .groups(gdpData, (d) => d.COU)
      .map(([key, values]) => {
        const data = values.map((d) => ({ year: d.Year, value: +d.Value }));
        const entries = calcPercentChange(data);
        return {
          country: key,
          entries: entries,
        };
      });

    const svg = d3
      .select(`#${id}`)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", [0, 0, w, h]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare the data
    const years = mappedData[0].entries.map((d) => d.year);

    // Define scales
    const xScale = d3
      .scalePoint()
      .domain(years)
      .range([0, w - margin.left - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(mappedData, (d) => d3.min(d.entries, (e) => e.change)),
        d3.max(mappedData, (d) => d3.max(d.entries, (e) => e.change)),
      ])
      .nice()
      .range([h, 0]);

    // define area
    const area = d3
      .area()
      .x((d) => xScale(d.year))
      .y0(() => yScale.range()[0])
      .y1((d) => yScale(d.value));

    // Draw axes
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${h - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    g.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", `translate(0,${-margin.bottom})`)
      .call(d3.axisLeft(yScale));

    // Draw lines for each country
    mappedData.forEach((countryData, i) => {
      g.append("path")
        .datum(
          countryData.entries.map((entry) => ({
            year: entry.year,
            value: entry.change,
          }))
        )
        .attr("class", "area")
        .attr("transform", `translate(0,${-margin.bottom})`)
        .attr("d", area)
        .style("stroke", d3.schemeCategory10[i]) // Use D3 color scheme for different colors
        .attr("fill", d3.schemeCategory10[i]);

      // create legend at top of graph
      const legend = d3.select("#legend2");
      legend
        .selectAll(".legendItem")
        .data(mappedData)
        .enter()
        .append("div")
        .attr("class", "legendItem")
        .html(
          // create a box for each colour to display our legend
          (
            d,
            i
          ) => `<div style="width: 1.5rem; height: 1.5rem; margin-right: 0.5rem; background: ${d3.schemeCategory10[i]};"></div>
      <span>${d.country}</span>`
        );
    });
  });
}

// Draw the graph once the DOM is fully loaded to the hardcoded id
document.addEventListener("DOMContentLoaded", function () {
  drawLineChart("graph1");
  drawAreaChart("graph2");
});
