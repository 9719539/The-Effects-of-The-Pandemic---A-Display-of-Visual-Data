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
    "rgb(135,160,188)",
    "rgb(127,205,187)",
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
    .scale(2250);

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
        .attr("viewBox", [0, 0, w, h])
        .attr("fill", "grey");

      // create color domain for our data
      let min = 0;
      let max = d3.max(mappedData, (d) => d[dataRange]);

      // colour scale using rgb range defined at top of function
      const colorScale = d3.scaleQuantize().domain([min, max]).range(rangeblue);

      max = d3.max(mappedData, (d) => d[dataRange]);
      d3.select("#highestCases").text(`Highest number of cases: ${max}`);

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
          d3.select("#cases").text(
            `Cases in ${d.properties.LGA_name}: ${d.properties[dataRange] || 0}`
          );
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke", "#fff").attr("stroke-width", 0.5);
          d3.select("#cases").text(
            "Mouse over an LGA to see the number of cases"
          );
        });

      // Function to update the map
      function updateMap(selectedData) {
        max = d3.max(json.features, (d) => d.properties[selectedData] || 0);
        d3.select("#highestCases").text(`Highest number of cases: ${max}`);
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
            d3.select("#cases").text(
              `Cases in ${d.properties.LGA_name}: ${
                d.properties[selectedData] || 0
              }`
            );
          })
          .on("mouseout", function () {
            d3.select(this).attr("stroke", "#fff").attr("stroke-width", 0.5);
            d3.select("#cases").text(
              "Mouse over an LGA to see the number of cases"
            );
          });

        d3.select("#choroInfo").text(`Highest cases: ${max}`);
      }

      // handle button class changes
      function updateButtons() {
        d3.selectAll(".cbtn").classed("selected", false);
      }

      // bind buttons to change choropleth data
      d3.select("#btn2020").on("click", function () {
        updateButtons();
        updateMap("Cases2020");
        d3.select("#btn2020").classed("selected", true);
      });

      d3.select("#btn2021").on("click", function () {
        updateButtons();
        updateMap("Cases2021");
        d3.select("#btn2021").classed("selected", true);
      });

      d3.select("#btn2022").on("click", function () {
        updateButtons();
        updateMap("Cases2022");
        d3.select("#btn2022").classed("selected", true);
      });

      d3.select("#btn2023").on("click", function () {
        updateButtons();
        updateMap("Cases2023");
        d3.select("#btn2023").classed("selected", true);
      });

      d3.select("#btnTotal").on("click", function () {
        updateButtons();
        updateMap("TotalCases");
        d3.select("#btnTotal").classed("selected", true);
      });
    });
  });
}

function drawTreemap(id) {
  // array of variables to search for in the data
  const desiredVariables = [
    "General practitioners",
    "Practising nurses",
    "Generalist medical practitioners",
    "Practising physicians",
  ];
  // load data from csv
  const dir = "./Datasets/HEALTH_REAC-2022-1-EN-20230430T100122.csv";
  d3.csv(dir).then((data) => {
    // filter only relevant healthcare data
    const medData = data.filter(
      (d) =>
        desiredVariables.includes(d.Variable) &&
        d.COU === "AUS" &&
        d.Year == 2018 &&
        (d.Measure === "Number of persons (head counts)" ||
          d.Measure === "Full-time equivalent persons (FTE)")
    );

    //map data to make more easily readable
    const mappedData = d3
      .groups(medData, (d) => d.Year)
      .map(([key, values]) => {
        const data = values.map((d) => ({
          variable: d.Variable,
          year: d.Year,
          value: +d.Value,
        }));
        return data;
      });

    // set values
    const w = 800;
    const h = 600;

    const hierarchicalData = {
      title: "Total hospital employment",
      children: mappedData.map((group) => ({
        title: group[0].variable, // Use the variable name as the parent
        children: group.map((item) => ({
          title: item.variable,
          year: item.year,
          value: item.value,
        })),
      })),
    };

    // create root of tree
    const root = d3.hierarchy(hierarchicalData).sum((d) => d.value);

    // calculate position of each element in the map
    d3.treemap().size([w, h]).padding(4)(root);

    // create svg
    const svg = d3
      .select(`#${id}`)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", [0, 0, w, h]);

    // draw treemap
    svg
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .style("stroke", "black")
      .style("fill", (d, i) => d3.schemeCategory10[i]);

    // add text labels
    svg
      .selectAll("text")
      .data(root.leaves())
      .enter()
      .append("foreignObject")
      .attr("x", (d) => d.x0 + 5)
      .attr("y", (d) => d.y0 + 5)
      .attr("width", 180)
      .attr("height", 80)
      .html(
        (d) =>
          `<span style="color: white; font-size: 1rem;">${d.data.title}</span> </br> <span style="color: white; font-size: 1rem;">${d.data.value}</span>`
      )
      .attr("font-size", "0.8rem")
      .attr("fill", "white");
  });
}

// Draw the graph once the DOM is fully loaded to the hardcoded id
document.addEventListener("DOMContentLoaded", function () {
  drawChoropleth("graph1");
  drawTreemap("graph2");
});
