import ZoneOccupancyChart from "./ZoneOccupancyChart";
import * as d3 from "d3";
import ZoneAnalyticsChart from "./ZoneAnalyticsChart";
import ZoneAnalyticsDataType, {
  TimeUsageWeekDaysDataType,
} from "../Types/ZoneAnalyticsDataType";
import { getWeekDayName } from "../_helper";
import { crumb } from "../svg/crumb";
import { zone } from "../svg/zone";

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
                        color: ${this.colorPalette.title};font-family: 'Montserrat';font-size: 14px;font-weight: bold">
              <div style="display: flex;align-items: center">
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="16" fill="white" fill-opacity="0.01"/><path d="M0.812502 6.82564L7.8125 10.8256C7.86951 10.8585 7.93418 10.8759 8 10.8759C8.06583 10.8759 8.13049 10.8585 8.1875 10.8256L15.1875 6.82564C15.2449 6.79284 15.2926 6.74545 15.3258 6.68826C15.359 6.63108 15.3765 6.56613 15.3765 6.50001C15.3765 6.43389 15.359 6.36894 15.3258 6.31176C15.2926 6.25457 15.2449 6.20718 15.1875 6.17439L8.1875 2.17439C8.13049 2.14147 8.06583 2.12415 8 2.12415C7.93418 2.12415 7.86951 2.14147 7.8125 2.17439L0.812502 6.17439C0.755087 6.20718 0.707364 6.25457 0.674171 6.31176C0.640977 6.36894 0.623495 6.43389 0.623495 6.50001C0.623495 6.56613 0.640977 6.63108 0.674171 6.68826C0.707364 6.74545 0.755087 6.79284 0.812502 6.82564ZM8 2.93189L14.2444 6.50001L8 10.0681L1.75563 6.50001L8 2.93189ZM15.3256 8.81251C15.3501 8.85527 15.3659 8.90243 15.3722 8.9513C15.3784 9.00017 15.3749 9.04979 15.362 9.09733C15.3491 9.14486 15.3269 9.18938 15.2967 9.22834C15.2666 9.2673 15.229 9.29994 15.1863 9.32439L8.18625 13.3244C8.12924 13.3573 8.06458 13.3746 7.99875 13.3746C7.93293 13.3746 7.86826 13.3573 7.81125 13.3244L0.811252 9.32439C0.724891 9.27466 0.661821 9.19266 0.635918 9.09643C0.610014 9.0002 0.623399 8.89762 0.673127 8.81126C0.722855 8.7249 0.804853 8.66183 0.901083 8.63593C0.997312 8.61002 1.09989 8.62341 1.18625 8.67314L7.99875 12.5669L14.8113 8.67314C14.8541 8.64827 14.9015 8.63214 14.9506 8.62569C14.9998 8.61924 15.0497 8.62259 15.0975 8.63555C15.1453 8.64851 15.1901 8.67083 15.2293 8.7012C15.2684 8.73157 15.3012 8.76941 15.3256 8.81251Z" fill=${this.colorPalette.title}></svg> 
              <span style="margin-left: 10px">All Zones</span>&nbsp; / </div>
              <div style="cursor: pointer;display: flex;align-items: center;margin-left: 10px" class="meeting-text"></div>
              <div style="color: ${this.colorPalette.focusBorder}; display: flex;align-items: center" class="zone-text"></div>
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
      .html(` ${crumb(this.colorPalette.focusBorder)}&nbsp;Meeting Rooms&nbsp;`)
      .style("color", this.colorPalette.focusBorder);
    d3.select(`#${this._id} div .zone-text`).text(``);

    this._selectedZone = "";
  }
  public DrawState2() {
    if (this._ZOChart) this._ZOChart.Destroy();

    d3.select(`#${this._id} div`).append("div").attr("id", `${this._id}-con`);
    d3.select(`#${this._id} div .meeting-text`)
      .html(
        ` ${crumb(this.colorPalette.title)}&nbsp;Meeting Rooms&nbsp; / &nbsp;`,
      )
      .style("color", this.colorPalette.title);
    d3.select(`#${this._id} div .zone-text`).html(
      `${zone} ${this._selectedZone}`,
    );

    let dataIndex = this._data.findIndex(
      (x: any) => x.Zone === this._selectedZone,
    );
    let data: any = this._data[dataIndex];

    try {
      let timeUsageWeekdaysData: TimeUsageWeekDaysDataType[] = [];
      for (let i = 0; i < data?.TimeUsageWeekdays.length; i++) {
        let timeUsageWeekDay: any = data?.TimeUsageWeekdays[i];
        timeUsageWeekdaysData.push({
          weekday: timeUsageWeekDay.weekday as number,
          weekdayName: getWeekDayName(
            timeUsageWeekDay.weekday as number,
          ) as string,
          EmptyHours: timeUsageWeekDay.Empty_Hours as number,
          EmptyHoursStr: timeUsageWeekDay.Empty_String as string,
          NormalHours: timeUsageWeekDay.Normal_Hours as number,
          NormalHoursStr: timeUsageWeekDay.Normal_String as string,
          OverUtilisedHours: timeUsageWeekDay.OverUtilised_Hours as number,
          OverUtilisedHoursStr: timeUsageWeekDay.OverUtilised_String as string,
          UnderUtilisedHours: timeUsageWeekDay.UnderUtilised_Hours as number,
          UnderUtilisedHoursStr:
            timeUsageWeekDay.UnderUtilised_String as string,
        });
      }
      let ZoneAnalyticsData: ZoneAnalyticsDataType = {
        AverageTimeUsageHours: data?.AverageTimeUsage_Hours as number,
        AverageTimeUsageHoursStr: data?.AverageTimeUsage_String as string,
        WorkingHours: data?.WorkingHours as number,
        TimeUsageWeekdays: timeUsageWeekdaysData,
      };
      this._ZAChart = new ZoneAnalyticsChart(
        `${this._id}-con`,
        ZoneAnalyticsData,
        this._width,
        this._height - 130,
      );
      this._ZAChart.DrawChart();
    } catch (error) {
      throw new Error("Data not valid!");
    }
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
