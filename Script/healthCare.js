function drawChoropleth(id) {
  const w = 400;
  const h = 400;

  // start showing total cases on load
  let dataRange = "TotalCases";

  // colour ranges for choropleth
  const rangeblue = [
    // "rgb(255,255,217)",
    // "rgb(237,248,177)",
    // "rgb(199,233,180)",
    // "rgb(127,205,187)",
    "rgb(65,182,196)",
    "rgb(29,145,192)",
    "rgb(34,94,168)",
    "rgb(37,52,148)",
    "rgb(8,29,88)",
  ];

  const projection = d3
    .geoMercator()
    .center([145, -36.5])
    .translate([w / 2, h / 2])
    .scale(2450);

  const path = d3.geoPath().projection(projection);
  d3.csv("./Datasets/ncov_cases_by_lga_table.csv").then((csvData) => {
    const mappedData = csvData.map((row) => ({
      LGA: row.LGA,
      Cases2020: Number(row["2020"]),
      Cases2021: Number(row["2021"]),
      Cases2022: Number(row["2022"]),
      Cases2023: Number(row["2023"]),
      TotalCases: Number(row.Total),
    }));

    // add geometry to map
    d3.json("./Datasets/LGA_VIC.json").then((json) => {
      for (let i = 0; i < json.features.length; i++) {
        const jsonLGA = json.features[i].properties.LGA_name;
        mappedData.forEach((row) => {
          if (row.LGA.includes(jsonLGA)) {
            // add data to json features
            json.features[i].properties.Cases2020 = row.Cases2020;
            json.features[i].properties.Cases2021 = row.Cases2021;
            json.features[i].properties.Cases2022 = row.Cases2022;
            json.features[i].properties.Cases2023 = row.Cases2023;
            json.features[i].properties.TotalCases = row.TotalCases;
          }
        });
      }

      // create svg
      const svg = d3
        .select(`#${id}`)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 400 400")
        .attr("fill", "grey");

      // create color domain for our data
      let min = 0;
      let max = d3.max(mappedData, (d) => d[dataRange]);

      // colour scale using rgb range defined at top of function
      const colorScale = d3.scaleQuantize().domain([min, max]).range(rangeblue);

      max = d3.max(mappedData, (d) => d[dataRange]);
      d3.select("#choroInfo").text(`Highest cases: ${max}`);

      // draw lgas
      const paths = svg
        .append("g")
        .selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", (d) => colorScale(d.properties[dataRange] || 0))
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", function (event, d) {
          d3.select(this).attr("stroke", "gold").attr("stroke-width", 1.5);
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke", "#fff").attr("stroke-width", 0.5);
        });

      // Function to update the map
      function updateMap(selectedData) {
        console.log(`updating map with ${selectedData}`);
        max = d3.max(json.features, (d) => d.properties[selectedData] || 0);
        colorScale.domain([0, max]);

        svg.selectAll("*").remove(); // Clear existing map elements

        svg
          .selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", (d) => colorScale(d.properties[selectedData] || 0))
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          .on("mouseover", function (event, d) {
            d3.select(this).attr("stroke", "gold").attr("stroke-width", 1.5);
          })
          .on("mouseout", function () {
            d3.select(this).attr("stroke", "#fff").attr("stroke-width", 0.5);
          });

        d3.select("#choroInfo").text(`Highest cases: ${max}`);
      }

      // bind buttons to change choropleth data
      d3.select("#btn2020").on("click", function () {
        updateMap("Cases2020");
      });

      d3.select("#btn2021").on("click", function () {
        updateMap("Cases2021");
      });

      d3.select("#btn2022").on("click", function () {
        updateMap("Cases2022");
      });

      d3.select("#btn2023").on("click", function () {
        updateMap("Cases2023");
      });

      d3.select("#btnTotal").on("click", function () {
        updateMap("TotalCases");
      });
    });
  });
}

// Draw the graph once the DOM is fully loaded to the hardcoded id
document.addEventListener("DOMContentLoaded", function () {
  drawChoropleth("graph1");
});

// data used for bubble chart
// spread of employees in healthcare in 2020
// col 2, col 5 (aus), col 7 year, col 9 value
