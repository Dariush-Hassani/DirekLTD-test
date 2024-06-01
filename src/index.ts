import ZoneAndTime from "./ChartComponents/ZoneAndTime";
const d = require("./Data/sample.json");

function calcWidth() {
  let maxWidth = 500;
  return window.innerWidth < maxWidth ? window.innerWidth - 10 : maxWidth;
}
let width = calcWidth();

let chart = new ZoneAndTime("zone-time", d, width, 600);
chart.DrawChart();

window.addEventListener("resize", () => {
  let width = calcWidth();
  chart.changeDimensions(width, 600);
});
