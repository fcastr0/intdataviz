// Setting our drawing space
const width = window.innerWidth * 0.85,
  height = window.innerHeight * 0.80,
  margin = { top: 20, bottom: 65, left: 70, right: 20 },
  radius = 7; 

const formatBillions = (num) => d3.format(".2s")(num).replace(/G/, 'B')
const formatDate = d3.timeFormat("%Y")  

// Variables we may need
let svg;
let xScale;
let yScale;
let yAxis;
let xAxisGroup;
let yAxisGroup;
let tooltip;
let runningtot;

// Application State
let state = {
    data: null,
    selection: "AUTOMOBILE ACCIDENT",
    hover: null,
    mousePosition: null 
};

// Loading data
d3.csv('../data/automobile.csv', (d) => {
  const formattedObj = {
    claimnumber: d.claimnumber,
    claimtype: d.claimtype,
    dateoccured: new Date(d.dateofoccurence),
    dateclaimfiled: new Date(d.dateclaimfiled),
    settlementdate: new Date(d.settlementdate),
    //settlementamount: new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(d.settlementamount)
    runningtotal: +d.yrtotal,
    runningtotformat: new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(d.yrtotal)
  }
  return formattedObj
})
  .then(data => {
    console.log("LOADED DATE:", data);
    state.data = data;
    init();
}); 

function init() {
// Scales
xScale = d3.scaleTime()
  .domain(d3.extent(state.data, d => d.settlementdate))
  .range([margin.left, width - margin.right])

yScale = d3.scaleLinear()
  .domain(d3.extent(state.data, d => d.runningtotal)) 
  .range([height - margin.bottom, margin.top])

const xAxis = d3.axisBottom(xScale)
yAxis = d3.axisLeft(yScale)
  .tickFormat(formatBillions)

colorScale = d3.scaleOrdinal(d3.schemeSet3) //might need to get rid of this

// Creating SVG
svg = d3.select("#d3-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

tooltip = d3.select("#d3-container")
  .append("div") //does this work?
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("top", 0) 
  .style("left", 0)

const xAxisGroup = svg.append("g")
  .attr("class", "xAxis")
  .attr("transform", `translate(${0}, ${height - margin.bottom})`)
  .call(xAxis)

xAxisGroup.append("text")
  .attr("class", 'axis-title')
  .attr("x", width / 2)
  .attr("y", 45)
  .attr("text-anchor", "middle")
  .attr("fill", "black")
  .attr("font-size", "13")
  .text("Settlement Date")

yAxisGroup = svg.append("g")
  .attr("class", "yAxis")
  .attr("transform", `translate(${margin.left}, ${0})`)
  .call(yAxis)

yAxisGroup.append("text")
  .attr("class", 'axis-title')
  .attr("transform", `translate(${-45}, ${height / 2})rotate(-90)`)
  .attr("text-anchor", "middle")
  .attr("fill", "black")
  .attr("font-size","13")
  .text("Settlement Amount in USD")

//Setup UI elements
const dropdown = d3.select("#dropdown")

dropdown.selectAll("options")
  .data([
    ...new Set(state.data.map(d => d.claimtype))])
  .join("option")
  .attr("value", d => d)
  .text(d => d)

dropdown.on("change", event => {
  console.log("DROP DOWN IS CHANGED TO", event.target.value)
  state.selection = event.target.value
  console.log("NEW STATE", state)
  draw();
  })

draw();
}

function draw() {

console.log("selected state is:", state.selection)
const filteredData = state.data
  .filter(d => state.selection === d.claimtype) 

//The following lines update y axis with selected filter:
yScale.domain([0, d3.max(filteredData, d => d.runningtotal)]) // resets max value on y axis
// creates animation and pushes updated y axis
yAxisGroup
  .transition()
  .duration(750)
  .call(yAxis.scale(yScale))

//console.log("Filtered Data:", filteredData)

const dots = svg
  .selectAll(".dot")
  .data(filteredData, d => d.settlementdate)
  .join(
    enter => enter.append("g")
      .attr("class", "dot")
      .attr("fill", "#581845")
      .attr("opacity", ".95")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("transform", d => `translate(${xScale(d.settlementdate)},${yScale(d.runningtotal)})`)
      ,
      update => update
      .call(update => update.transition()
      .duration(750)
      .attr("transform", d => `translate(${xScale(d.settlementdate)},${yScale(d.runningtotal)})`))
      ,
      exit => exit.remove()
  ).on("mouseenter", (event, d) => {
    console.log("EXECUTED", event, d)
    state.hover = {
      position: [
        d.x + (d.x - d.x) / 2,
        d.y + (d.y - d.y) /2
      ],
      name: d.data.runningtotformat
    }
    .on("mouseleave", () => {
      state.hover = null
    })
    // console.log("EVENT", event, d)
    // tooltip.style("transform", `translate(${xScale(d.settlementdate) + 10}px,${yScale(d.runningtotal) +10}px)`)
    // .text(d.runningtotformat)
  }
  )
if (state.hover) {
  tooltip
    .html(
      `
      <div>Amount Dispersed: ${state.hover.name}</div>
      `
    )
    .transition()
    .duration(300)
    .style("background-color", "#92A8D1")
    .style("transform", `translate(${state.hover.position[0]}px, ${state.hover.position[1]}px)`)
}
tooltip.classed("visible", state.hover)

dots.selectAll("circle")
    .data(d => [d])
    .join("circle")
    .attr("r", radius)
  
  const lineFunction = d3.line()
  .x(d => xScale(d.settlementdate))
  .y(d => yScale(d.runningtotal))

svg.selectAll("path.line")
  .data([filteredData])
  .join("path")
  .attr("class", "line")
  .attr("d", d => lineFunction(d))
  .attr("fill", "none")
  .attr("stroke", "#581845")
  .attr("stroke-width", "2")
  .transition()
  .duration(750)

const areaPath = d3.area()
  .x(d => xScale(d.settlementdate))
  .y0(yScale(0))
  .y1(d => yScale(d.runningtotal))

svg.selectAll(".area")
  .data([filteredData])
  .join("path")
  .attr("class", "area")
  .attr("fill", "#581845")
  .attr("opacity", .15)
  .transition()
  .duration(750)
  .attr("d", d => areaPath(d))
}
