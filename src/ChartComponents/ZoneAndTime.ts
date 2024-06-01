import ZoneOccupancyChart from "./ZoneOccupancyChart";
import * as d3 from "d3";
import ZoneAnalyticsChart from "./ZoneAnalyticsChart";

class ZoneAndTime {
  //private fields
  private readonly _id: string;
  private _data: unknown[];
  private _width: number;
  private _height: number;
  private _zoneOccupancyData: ZoneOccupancyDataType[];
  private _selectedZone: string = "";
  private _ZOChart: ZoneOccupancyChart | undefined;
  private _ZAChart: ZoneAnalyticsChart | undefined;

  public constructor(id: string, data: any[], width: number, height: number) {
    this._id = id;
    this._data = data;
    this._width = width;
    this._height = height;

    try {
      let zoneOccupancyData: ZoneOccupancyDataType[] = [];
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        zoneOccupancyData.push({
          Zone: item?.Zone as string,
          Peak: item?.Peak as number,
          Average: item?.Average as number,
          Capacity: item?.Capacity as number,
        });
      }
      this._zoneOccupancyData = zoneOccupancyData;
    } catch (error) {
      throw new Error("Data not suit for this chart.");
    }
  }

  //public fields
  public colorPalette = {
    AverageColor: "#68CDDC",
    CapacityColor: "#51919B",
    PeakColor: "#111827",
    textThin: "#9CA3AF",
    textBold: "#6B7280",
    ticks: "#E5E7EB",
    focusBorder: "#00A9C2",
    title: "#1F2937",
  };

  //private Methods
  public SetupLayout() {
    d3.select(`#${this._id}`)
      .style("width", `${this._width}px`)
      .style("height", `${this._height}px`);
    d3.select(`#${this._id}`).html(`
        <div>
          <h1 style="color: ${this.colorPalette.textBold};font-family: 'Montserrat';font-size: 24px">Zone Analytics</h1>
          <div style="background: #F9FAFB;height: 40px;margin: 30px 0;display: flex; align-items: center;padding-left: 15px;
                        color: ${this.colorPalette.title};font-family: 'Montserrat';font-size: 20px;font-weight: bold">
              <span>All Zones / </span>
              <span style="cursor: pointer;" class="meeting-text">&nbsp;Meeting Rooms&nbsp;</span>
              <span style="color: ${this.colorPalette.focusBorder}" class="zone-text"></span>
          </div>
        </div>
    `);
  }
  //public Methods
  public DrawState1() {
    if (this._ZAChart) this._ZAChart.Destroy();
    d3.select(`#${this._id} div`).append("div").attr("id", `${this._id}-con`);
    this._ZOChart = new ZoneOccupancyChart(
      `${this._id}-con`,
      this._zoneOccupancyData,
      this._width,
      this._height - 130,
      (selectedZone: string) => {
        this._selectedZone = selectedZone;
        this.DrawState2();
      },
    );
    this._ZOChart.DrawChart();

    d3.select(`#${this._id} div .meeting-text`)
      .html("&nbsp; Meeting Rooms")
      .style("color", this.colorPalette.focusBorder);
    d3.select(`#${this._id} div .zone-text`).text(``);

    this._selectedZone = "";
  }
  public DrawState2() {
    if (this._ZOChart) this._ZOChart.Destroy();
    d3.select(`#${this._id} div`).append("div").attr("id", `${this._id}-con`);
    d3.select(`#${this._id} div .meeting-text`)
      .html("&nbsp; Meeting Rooms /&nbsp;")
      .style("color", this.colorPalette.title);
    d3.select(`#${this._id} div .zone-text`).text(`${this._selectedZone}`);
    this._ZAChart = new ZoneAnalyticsChart(`${this._id}-con`);
  }
  public DrawChart() {
    this.SetupLayout();
    this.DrawState1();
    d3.select(`#${this._id} div .meeting-text`).on("click", () =>
      this.DrawState1(),
    );
  }
}

export default ZoneAndTime;
