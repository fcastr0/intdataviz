// Setting our drawing space
const width = window.innerWidth * 0.95,
  height = window.innerHeight * 0.90,
  margin = { top: 20, bottom: 65, left: 60, right: 30 },
  radius = 2.5;

// Variables we may need
let svg;
let xScale;
let yScale;
let xAxis;
let yAxis;
let xAxisGroup;
let yAxisGroup;
let tooltip;

// Aplication State
let state = {
    data: [],
    hover: null,
    mousePosition: null 
};

// Loading data
d3.csv('../data/nypdclaims.csv', (d) => {
  return {
    claimnumber: d.claimnumber,
    claimtype: d.claimtype,
    occured: new Date(d.dateofoccurence),
    claimfiled: new Date(d.dateclaimfiled),
    borough: d.occurenceborough,
    settlementdate: new Date(d.settlementdate),
    settlementamount: new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(d.settlementamount)
  }
})
  .then(data => {
    console.log("LOADED DATE:", data);
    state.data = data;
    init();
  })



function init() {

}

function draw() {

}