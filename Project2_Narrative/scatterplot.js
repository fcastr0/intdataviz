/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 60, left: 60, right: 40 },
  radius = 5;

let svg;
let xScale;
let yScale;
let tooltip;
//let colorScale;

//application state
let state = {
  data: null,
  hover: null,
  mousePosition: null
};

//data
d3.csv("../data/topartistsranked.csv", d3.autoType).then(raw_data => {
  console.log("data", raw_data);
  state.data = raw_data;
  init();
});

function init() {
  //SCALES
  xScale = d3.scaleLinear()
    .domain(d3.extent(state.data, d => d.hrsplayed))
    .range([margin.left, width - margin.right])

  yScale = d3.scaleLinear()
    .domain(d3.extent(state.data, d => d.ranking))
    .range([height - margin.bottom, margin.top])

  //const colorScale = d3.scaleSequential(d3.interpolateOrRd)
    //.domain([0, d3.max(state.data, d => d.ranking)])

  //AXES
  const xAxis = d3.axisBottom(xScale)
    .ticks(45)
  
  const yAxis = d3.axisLeft(yScale)

  //SVG
  svg = d3.select("#scatterplotsvg")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
  
  tooltip = d3.select("#scatterplotsvg")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("top", 0)
    .style("left", 0)

  // CALL AXES
  const xAxisGroup = svg.append("g")
    .attr("class", 'xAxis')
    .attr("transform", `translate(${0}, ${height - margin.bottom})`) // move to the bottom
    .call(xAxis)

  const yAxisGroup = svg.append("g")
    .attr("class", 'yAxis')
    .attr("transform", `translate(${margin.left}, ${0})`) // align with left margin
    .call(yAxis)

  //add labels
  xAxisGroup.append("text")
    .attr("class", 'axis-title')
    .attr("x", width / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("font-size", 13)
    .text("Total Hours Listened")

  yAxisGroup.append("text")
    .attr("class", 'axis-title')
    .attr("transform", `translate(${-38}, ${height / 2})rotate(-90)`)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("font-size", 13)
    .text("Personal Rating")

  draw(); 
}

function draw() {

  // + FILTER DATA BASED ON STATE
  const dots = svg
    .selectAll("circle")
    .data(state.data)
    .join(
      enter => enter.append("circle")
        .attr("r", radius)
        .attr("cx", d => xScale(d.hrsplayed)) // start dots on the top
        .attr("cy", margin.top)
        .attr("fill", "#ff7f50")
        .attr("stroke", "black")
        .attr("stroke-width", .80)
        .attr("stroke-opacity", .25)
        .call(enter => enter.transition()
          .duration(1000)
          //.delay((d, i) => i * 3)
          .attr("cy", d => yScale(d.ranking))
        ),
      update => update
        .call(update => update),

      exit => exit
        .call(exit => exit)
        .remove()
    ).on("mouseenter", (event, d) => {
      tooltip
      .html(
        `
        <div>I listened to</div>
        <div><b>${d.artist}</b></div>
        <div>For a total of ${d.hrsplayedround} hours</div>
        `
      )
      .classed("visible", true)
      .style("transform", `translate(${xScale(d.hrsplayed)+225}px,${yScale(d.ranking)+660}px)`)
    })
    .on("mouseleave", () => {
      tooltip
      .html(
        ""
      )
      .classed("visible", false)
    })

}
