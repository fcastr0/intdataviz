//constants and globals
const widthbar = window.innerWidth * 0.80,
heightbar = window.innerHeight * 0.7,
marginbar= { top: 20, bottom: 50, left: 130, right: 50 };

let svgbar;
let xScaleBar;
let yScaleBar;
let yAxisBar
let xAxisGroupBar;
let yAxisGroupBar;
//let colorScale;

let statetopbar = {
  data: null,
};

d3.csv("../data/top20.csv", d3.autotype).then(raw_data => {
  statetopbar.data = raw_data;
  initbar();
});

function initbar() {

  const color = d3.scaleSequential()
    .domain([0, d3.max(statetopbar.data, d => d.hrsplayedrounded)])
    .interpolator(d3.interpolateYlOrRd)
  
  xScaleTopBar = d3.scaleLinear()
    .domain([0, 80])
    .range([marginbar.left, widthbar - marginbar.right])

  yScaleTopBar = d3.scaleBand()
    .domain(statetopbar.data.map(d => d.artist))
    .range([marginbar.top, height - marginbar.bottom])
    .paddingInner(.5)
    .padding(.25)

  const xAxisBar = d3.axisBottom(xScaleTopBar)
  yAxisBar = d3.axisLeft(yScaleTopBar)

  svgbar = d3.select("#barchartsvg")
    .append("svg")
    .attr("width", widthbar)
    .attr("height", heightbar)

  svgbar.selectAll("rect")
  .data(statetopbar.data)
  .join("rect")
  .attr("width", d => xScaleTopBar(d.hrsplayedrounded))
  .attr("height", yScaleTopBar.bandwidth())
  .attr("x", marginbar.left)
  .attr("y", d => yScaleTopBar(d.artist))
  .attr("fill", d => color(d.hrsplayedrounded))

  const xAxisGroupBar = svgbar.append("g")
    .attr("class", "xAxisBar")
    .attr("transform", `translate(${0}, ${heightbar - marginbar.bottom})`)
    .call(xAxisBar)
  
  xAxisGroupBar.append("text")
    .attr("class", "xAxisTitle")
    .attr("x", widthbar / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("font-size", 14)
    .text("Total Hours Played")
  
  yAxisGroupBar = svgbar.append("g")
  .attr("class", "yAxisBar")
  .attr("transform", `translate(${marginbar.left}, ${0})`)
  .call(yAxisBar)

  yAxisGroupBar.append("text")
  .attr("class", "yAxisTitle")
  .attr("transform", `translate(${-110}, ${heightbar / 2})rotate(-90)`)
  .attr("text-anchor", "middle")
  .attr("fill", "black")
  .attr("font-size", 14)
  .text("Artists") 
  
}