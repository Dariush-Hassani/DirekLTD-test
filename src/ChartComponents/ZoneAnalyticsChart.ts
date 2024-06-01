import * as d3 from "d3";
class ZoneAnalyticsChart {
  private _id: string;
  constructor(id: string) {
    this._id = id;
    d3.select(`#${this._id}`).append("span").text("zone");
  }

  public Destroy() {
    d3.select(`#${this._id}`).remove();
  }
}

export default ZoneAnalyticsChart;
