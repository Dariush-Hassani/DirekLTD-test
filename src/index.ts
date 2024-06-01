import ZoneOccupancyChart from "./ChartComponents/ZoneOccupancyChart";
import ZoneAndTime from "./ChartComponents/ZoneAndTime";
const d = require("./Data/sample.json");

let chart = new ZoneAndTime("zone-time", d, 550, 600);
chart.DrawChart();
