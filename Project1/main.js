// Setting our drawing space
const width = window.innerWidth * 0.95,
  height = window.innerHeight * 0.90,
  margin = { top: 20, bottom: 65, left: 60, right: 30 },
  radius = 2.5; 

const formatBillions = (num) => d3.format(".2s")(num).replace(/G/, 'B')
const formatDate = d3.timeFormat("%Y")  

// Variables we may need
let svg;
let xScale;
let yScale;
let xAxis;
let yAxis;
let xAxisGroup;
let yAxisGroup;
let tooltip;
let dots;
let runningtot;
let colorScale;

// Application State
let state = {
    data: [],
    selection: "AUTOMOBILE ACCIDENT",
    hover: null,
    mousePosition: null, 
};

// Loading data
d3.csv('../data/nypdclaims.csv', (d) => {
  const formattedObj = {
    claimnumber: d.claimnumber,
    claimtype: d.claimtype,
    dateoccured: new Date(d.dateofoccurence),
    dateclaimfiled: new Date(d.dateclaimfiled),
    borough: d.occurenceborough,
    settlementdate: new Date(d.settlementdate),
    //settlementamount: new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(d.settlementamount) This isnt mapping on the graph can we fix it?
    settlementamount: +d.settlementamount
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
  .domain(d3.extent(state.data, d => d.settlementamount)) //may need to make this into a range [0, max]
  .range([height - margin.bottom, margin.top])

const xAxis = d3.axisBottom(xScale)
yAxis = d3.axisLeft(yScale)
  .tickFormat(formatBillions)

colorScale = d3.scaleOrdinal();

// Creating SVG
svg = d3.select("#d3-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

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
  .attr("font-size","13")
  .text("Settlement Date")

yAxisGroup = svg.append("g")
  .attr("class", "yAxis")
  .attr("transform", `translate(${margin.left}, ${0})`)
  .call(yAxis)

yAxisGroup.append("text")
  .attr("class", 'axis-title')
  .attr("x", -40)
  .attr("y", height / 2)
  .attr("writing-mode", "vertical-lr")
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
  console.log("DROP DOWN IS CHANGED", event.target.value)
  state.selection = event.target.value
  console.log("NEW STATE", state)
  draw();
  })

draw();
}

function draw() {
console.log("selected state is:", state.selection)
const filteredData = state.data
  //.filter(d => state.selection === d.claimtype) 
  .filter(d => d.claimtype === state.selection) //makes sure our claim type data matches our dropdown selection

// yScale
// .domain(d3.extent(filteredData, d => d.settlementamount))

//The following lines update y axis with selected filter:
yScale.domain([0, d3.max(filteredData, d => d.settlementamount)]) // resets max value on y axis
// creates animation and pushes updated y axis
yAxisGroup
  .transition()
  .duration(1000)
  .call(yAxis.scale(yScale))

//const runningtot = d3.cumsum(state.data, d => d.settlementamount) does this work? how can i implement this

//console.log("Filtered Data:", filteredData)

const dots = svg
  .selectAll(".dot")
  .data(filteredData, d => d.settlementdate)
  .join(
    enter => enter.append("g")
      .attr("class", "dot")
      .attr("fill", d => colorScale(d.claimtype))
      .attr("transform", d => `translate(${xScale(d.settlementdate)},${yScale(d.settlementamount)})`)
      ,
      update => update
      .call(update => update.transition()
      .duration(1000)
      .attr("transform", d => `translate(${xScale(d.settlementdate)},${yScale(d.settlementamount)})`))
      ,
      exit => exit.remove()
  );

dots.selectAll("circle")
    .data(d => [d])
    .join("circle")
    .attr("r", radius)

const lineFunction = d3.line()
  .x(d => xScale(d.settlementdate))
  .y(d => yScale(d.settlementamount))

svg.selectAll("path.line")
  .data([filteredData])
  .join("path")
  .attr("class", "line")
  .attr("d", d => lineFunction(d))
  .attr("fill", "none")
  .attr("stroke", d => colorScale(d.claimtype))

const areaPath = d3.area()
  .x(d => xScale(d.settlementdate))
  .y0(yScale(0))
  .y1(d => yScale(d.settlementamount))

svg.selectAll(".area")
  .data([filteredData])
  .join("path")
  .attr("class", "area")
  .attr("fill", d => colorScale(d.claimtype))
  .attr("opacity", .20)
  .transition()
  .duration(1000)
  .attr("d", d => areaPath(d))
}
