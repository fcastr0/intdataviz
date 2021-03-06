let svgBar;
let xScaleBar;
let yScaleBar;
let yAxisBar;
let xAxisGroupBar;
let yAxisGroupBar;
let color;

let stateBar = {
    data: null,
    selection: "Choose One",
};

// Loading data
d3.csv('../data/nypdboroughclaims.csv', (d) => {
  const formattedObj = {
    borough: d.borough,
    boroughcount: +d.boroughcount
  }
  return formattedObj
})
  .then(data => {
    console.log("LOADED DATE:", data);
    stateBar.data = data;
    initBar();
});

function initBar() {
  //Scales

const color = d3.scaleSequential()
  .domain([0, d3.max(stateBar.data, d => d.boroughcount)])
  .interpolator(d3.interpolateReds)

xScaleBar = d3.scaleBand()
  .domain(stateBar.data.map(d => d.borough))
  .range([margin.left, width - margin.right])
  .paddingInner(.35)
  .padding(.15)

yScaleBar = d3.scaleLinear()
  .domain([0, 13500])
  .range([height - margin.bottom, margin.top])
  
const xAxisBar = d3.axisBottom(xScaleBar)
yAxisBar = d3.axisLeft(yScaleBar)
  .tickFormat(formatBillions)

svgBar = d3.select("#d3barchart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

svgBar.selectAll("rect")
  .data(stateBar.data)
  .join("rect")
  .attr("width", xScaleBar.bandwidth())
  .attr("height", d => height -  yScaleBar(d.boroughcount) - margin.bottom) // not sure whats going on
  .attr("x", d => xScaleBar(d.borough))
  .attr("y", d => yScaleBar(d.boroughcount))
  .attr("fill", d => color(d.boroughcount))
  // .attr("stroke", "white")
  .attr("stroke-width", 1)

const xAxisGroupBar = svgBar.append("g")
  .attr("class", "xAxisBar")
  .attr("transform", `translate(${0}, ${height - margin.bottom})`)
  .call(xAxisBar)
  
xAxisGroupBar.append("text")
  .attr("class", 'xaxis-titlebar')
  .attr("x", width / 2)
  .attr("y", 45)
  .attr("text-anchor", "middle")
  .attr("fill", "black")
  .attr("font-size", "13")
  .text("Boroughs")

yAxisGroupBar = svgBar.append("g")
  .attr("class", "yAxisBar")
  .attr("transform", `translate(${margin.left}, ${0})`)
  .call(yAxisBar)

yAxisGroupBar.append("text")
  .attr("class", 'yaxis-titlebar')
  .attr("transform", `translate(${-45}, ${height / 2})rotate(-90)`)
  .attr("text-anchor", "middle")
  .attr("fill", "black")
  .attr("font-size", "13")
  .text("Claims Made per Borough")
}

