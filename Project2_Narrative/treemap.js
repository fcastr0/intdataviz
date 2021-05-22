//constants and globals
 const widthtree = window.innerWidth * 0.55,
 heighttree = window.innerHeight * 0.7,
 margintree = { top: 20, bottom: 50, left: 60, right: 40 };

let svgtree;
let tooltiptree;
let colorScale;

//aapplication state
let statetree = {
  data: null,
  hover: null,
  mousePosition: null
};

//data
d3.json("../data/topdays.json", d3.autotype).then(raw_data => {
 statetree.data = raw_data;
 inittree();
});


function inittree() {
const colorScale = d3.scaleSequential(d3.interpolateYlGn)
  .domain([200, 400])

const container = d3.select("#treemapsvg")
  .style("position", "relative");

tooltiptree = d3.select("#treemapsvg")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("top", 0)
  .style("left", 0)

svgtree = container
  .append("svg")
  .attr("width", widthtree)
  .attr("height", heighttree)

const root = d3.hierarchy(statetree.data)
  //console.log("ROOT", root)
  .sum(d => d.value)

const treeLayout = d3.treemap()
  .size([widthtree, heighttree])
  .padding(3)

treeLayout(root)
  console.log("root after layout function:", root)

const leaves = root.leaves()
console.log("LEAVES:", leaves)

const leafGroup = svgtree.selectAll("g")
  .data(leaves)
  .join("g")
  .attr("transform", d => `translate(${d.x0}, ${d.y0})`)

leafGroup.append("rect")
  //.attr("fill", "purple")
  .attr("class", "backgroundcolor")
  .attr("width", d => d.x1 - d.x0)
  .attr("height", d => d.y1 - d.y0)
  .attr("fill", d => {
    //console.log(d)
    return colorScale(d.value)
  })
  .on("mouseenter", (event, d ) => {
   // console.log("EVENT AND D IS:",event,d)
    tooltiptree
    .html(
      `
      <div> I listened to ${d.data.value}</div>
      <div> hours of music on ${d.data.name}s</div>
      `
    )
    .classed("visible", true)
    .style("transform", `translate(${((d.x0 + d.x1) / 2) +210}px,${((d.y0 + d.y1) / 2)-45}px)`)
  })
  .on("mouseleave", () => {
    tooltiptree
    .html(
      ""
    )
    .classed("visible", false)
  })

leafGroup.append("text")
  .attr("dy", "1.5em")
  .attr("dx", ".5em")
  .text(d => d.data.name)
  .attr("fill", "black")
  //.attr("stroke", "gray")


 drawtree(); 
}

function drawtree() {

}
