class LineCircleChart {
  constructor(dataURL, containerID, allGroup, xDomain, yDomain) {
    this.dataURL = dataURL;
    this.containerID = containerID;
    this.allGroup = allGroup;
    this.xDomain = xDomain;
    this.yDomain = yDomain;
  }

  createGraph() {
    const dataURL = this.dataURL;
    const containerID = this.containerID;
    const allGroup = this.allGroup;
    const xDomain = this.xDomain;
    const yDomain = this.yDomain;

    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 100, bottom: 30, left: 30 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the container
    const svg = d3
      .select(containerID)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Read the data
    d3.csv(dataURL).then(function (data) {
      // Reformat the data: we need an array of arrays of {x, y} tuples
      const dataReady = allGroup.map(function (grpName) {
        return {
          name: grpName,
          values: data.map(function (d) {
            return { time: d.time, value: +d[grpName] };
          }),
        };
      });

      // A color scale: one color for each group
      const myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet2);

      // Add X axis --> it is a linear scale
      const x = d3.scaleLinear()
        .domain(xDomain)
        .range([0, width]);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      // Add Y axis
      const y = d3.scaleLinear()
        .domain(yDomain)
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Add the lines
      const line = d3.line()
        .x(d => x(+d.time))
        .y(d => y(+d.value));
      svg.selectAll("myLines")
        .data(dataReady)
        .join("path")
        .attr("class", d => d.name)
        .attr("d", d => line(d.values))
        .attr("stroke", d => myColor(d.name))
        .style("stroke-width", 2)
        .style("fill", "none");

      // Add the points
      svg.selectAll("myDots")
        .data(dataReady)
        .join('g')
        .style("fill", d => myColor(d.name))
        .attr("class", d => d.name)
        .selectAll("myPoints")
        .data(d => d.values)
        .join("circle")
        .attr("cx", d => x(d.time))
        .attr("cy", d => y(d.value))
        .attr("r", 3)
        .attr("stroke", "white");

      // Add a label at the end of each line
      svg.selectAll("myLabels")
        .data(dataReady)
        .join('g')
        .append("text")
        .attr("class", d => d.name)
        .datum(d => {
          return { name: d.name, value: d.values[d.values.length - 1] };
        })
        .attr("transform", d => `translate(${x(d.value.time)},${y(d.value.value)})`)
        .attr("x", 8)
        .text(d => d.name)
        .style("fill", d => myColor(d.name))
        .style("font-size", 10);
    });
  }
}