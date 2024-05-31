import ZoneOccupancyChart from "./ChartComponents/ZoneOccupancyChart";
const d = require("./Data/sample.json");

let data: ZoneOccupancyDataType[] = [];
for (let i = 0; i < d.length; i++) {
  let item = d[i];
  data.push({
    Zone: item.Zone as string,
    Peak: item.Peak as number,
    Average: item.Average as number,
    Capacity: item.Capacity as number,
  });
}

let chart1 = new ZoneOccupancyChart("oc-chart", data, 500, 450);
chart1.DrawChart();
