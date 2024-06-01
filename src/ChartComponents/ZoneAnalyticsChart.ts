import * as d3 from "d3";
import ZoneAnalyticsDataType, {
  TimeUsageWeekDaysDataType,
} from "../Types/ZoneAnalyticsDataType";
import { formatHoursMinuts } from "../_helper";
class ZoneAnalyticsChart {
  //public fields
  public colorPalette = {
    NormalColor: "#68CDDC",
    OverUtilisedColor: "#51919B",
    textThin: "#9CA3AF",
    textBold: "#6B7280",
    ticks: "#E5E7EB",
    focusBorder: "#00A9C2",
    emptyColor: "#FDAD9C",
    underUtilisedColor: "#FDC793",
  };

  public config = {
    EmptySpaceBetweenBars: 15, //(px)
    marginTop: 0,
    marginLeft: 0,
    marginBottom: 0,
    marginRight: 0,
    paddingTop: 120,
    paddingLeft: 100,
    paddingBottom: 40,
    paddingRight: 0,
    opacityHover: 0.3,
    focusBorderEmptySpace: 8,
    infoTriangleWidth: 8,
    transitionDuration: 1000,
    transitionDelay: 100,
  };

  //private fields
  private readonly _id: string;
  private _data: ZoneAnalyticsDataType;
  private _width: number;
  private _height: number;
  private _chartWidth: number;
  private _chartHeight: number;
  private _xScaleFunction: d3.ScaleBand<string> = d3.scaleBand();
  private _yScaleFunction: d3.ScaleLinear<number, number> = d3.scaleLinear();
  private _onTransition: boolean = false;

  public constructor(
    id: string,
    data: ZoneAnalyticsDataType,
    width: number,
    height: number,
  ) {
    this._id = id;
    this._data = data;
    this._width = width;
    this._height = height;
    this._chartWidth =
      width - (this.config.marginLeft + this.config.marginRight);
    this._chartHeight =
      height - (this.config.marginBottom + this.config.marginTop);
  }

  //private methods
  private SetupLayout(): void {
    d3.select(`#${this._id}`)
      .style("width", `${this._width}px`)
      .style("height", `${this._height}px`)
      .append("svg")
      .attr("width", this._chartWidth)
      .attr("height", `${this._chartHeight}`)
      .style("position", "relative")
      .style("left", `${this.config.marginLeft}px`)
      .style("top", `${this.config.marginTop}px`);

    d3.select(`#${this._id} svg`)
      .append("text")
      .text("Time Usage")
      .style("fill", this.colorPalette.textBold)
      .style("font-size", "22px")
      .style("font-weight", "600")
      .attr("y", "24")
      .attr("x", "0")
      .style("font-family", "Montserrat");
  }

  private SetupLegends(): void {
    d3.select(`#${this._id} svg`)
      .append("g")
      .attr("y", "44")
      .attr("class", "legend");

    d3.select(`#${this._id} svg .legend`)
      .append("circle")
      .attr("cy", "55")
      .attr("cx", "10")
      .attr("r", "10")
      .attr("fill", this.colorPalette.emptyColor);

    d3.select(`#${this._id} svg .legend`)
      .append("text")
      .text("Empty")
      .attr("y", "60")
      .attr("x", "24")
      .style("font-family", "Montserrat")
      .style("fill", this.colorPalette.textBold)
      .style("font-size", "12px")
      .style("font-weight", "600");

    d3.select(`#${this._id} svg .legend`)
      .append("circle")
      .attr("cy", "55")
      .attr("cx", "85")
      .attr("r", "10")
      .attr("fill", this.colorPalette.underUtilisedColor);

    d3.select(`#${this._id} svg .legend`)
      .append("text")
      .text("UnderUtilised")
      .attr("y", "60")
      .attr("x", "99")
      .style("font-family", "Montserrat")
      .style("fill", this.colorPalette.textBold)
      .style("font-size", "12px")
      .style("font-weight", "600");

    d3.select(`#${this._id} svg .legend`)
      .append("circle")
      .attr("cy", "55")
      .attr("cx", "203")
      .attr("r", "10")
      .attr("fill", this.colorPalette.NormalColor);

    d3.select(`#${this._id} svg .legend`)
      .append("text")
      .text("Normal")
      .attr("y", "60")
      .attr("x", "217")
      .style("font-family", "Montserrat")
      .style("fill", this.colorPalette.textBold)
      .style("font-size", "12px")
      .style("font-weight", "600");

    d3.select(`#${this._id} svg .legend`)
      .append("circle")
      .attr("cy", "55")
      .attr("cx", "280")
      .attr("r", "10")
      .attr("fill", this.colorPalette.OverUtilisedColor);

    d3.select(`#${this._id} svg .legend`)
      .append("text")
      .text("OverUtilised")
      .attr("y", "60")
      .attr("x", "294")
      .style("font-family", "Montserrat")
      .style("fill", this.colorPalette.textBold)
      .style("font-size", "12px")
      .style("font-weight", "600");
  }

  private SetupScaleFunctions(): void {
    this._xScaleFunction = d3
      .scaleBand()
      .domain(this._data.TimeUsageWeekdays.map((x) => x.weekdayName))
      .range([
        0,
        this._chartWidth - (this.config.paddingRight + this.config.paddingLeft),
      ]);

    this._yScaleFunction = d3
      .scaleLinear()
      .domain([this._data.WorkingHours, 0])
      .range([
        0,
        this._chartHeight -
          (this.config.paddingBottom + this.config.paddingTop),
      ]);
  }

  private SetupXAxis(): void {
    let tickSize =
      this._chartHeight - (this.config.paddingBottom + this.config.paddingTop);
    let xAxis = d3.axisBottom(this._xScaleFunction).tickSize(tickSize);
    d3.select(`#${this._id} svg`)
      .append("g")
      .attr("class", "xAxis")
      .style(
        "transform",
        `translate(${this.config.paddingLeft}px,${this.config.paddingTop}px)`,
      )
      .call(xAxis);

    d3.select(`#${this._id} svg g path`).style("stroke", "none");
    d3.selectAll(`#${this._id} .xAxis .tick line`).style("stroke", "none");

    d3.selectAll(`#${this._id}  g g text`)
      .style("font-size", "14px")
      .style("font-family", "Montserrat")
      .style("transform", `translate(0px,20px)`) //10 for size of font
      .style("color", `${this.colorPalette.textThin}`);
  }

  private SetupYAxis(): void {
    let tickSize =
      this._chartWidth - (this.config.paddingRight + this.config.paddingLeft);
    let yAxis = d3
      .axisRight(this._yScaleFunction)
      .tickSize(tickSize)
      .ticks(7)
      .tickFormat((d) => `${d}h`);
    d3.select(`#${this._id} svg`)
      .append("g")
      .attr("class", "yAxis")
      .style(
        "transform",
        `translate(${this.config.paddingLeft}px,${this.config.paddingTop}px)`,
      )
      .call(yAxis);

    d3.selectAll(`#${this._id} .yAxis g text`)
      .style("font-size", "14px")
      .style("font-family", "Montserrat")
      .style("transform", `translate(${-tickSize - 40}px,0px)`) //40 for size of font
      .style("color", `${this.colorPalette.textThin}`);

    d3.select(`#${this._id} .yAxis path`)
      .style("stroke", `${this.colorPalette.ticks}`)
      .style("stroke-width", `1px`)
      .style("stroke-dasharray", `6px`);

    d3.selectAll(`#${this._id} .yAxis g line`)
      .style("stroke", `${this.colorPalette.ticks}`)
      .style("stroke-width", `2px`);
  }

  private HeightGetter(
    d: TimeUsageWeekDaysDataType,
    barType: "Empty" | "UnderUtilised" | "OverUtilised" | "Normal",
  ) {
    return (
      this._chartHeight -
      (this.config.paddingBottom + this.config.paddingTop) -
      this._yScaleFunction(
        barType === "Normal"
          ? d.NormalHours
          : barType === "Empty"
            ? d.EmptyHours
            : barType === "OverUtilised"
              ? d.OverUtilisedHours
              : d.UnderUtilisedHours,
      )
    );
  }
  private DrawBars(
    barType: "Empty" | "UnderUtilised" | "OverUtilised" | "Normal",
  ): void {
    this._onTransition = true;

    let bandwidth = this._xScaleFunction.bandwidth();
    let barWidth = bandwidth - this.config.EmptySpaceBetweenBars;

    let startPoint = this.config.paddingTop;

    d3.select(`#${this._id} svg`)
      .selectAll()
      .data(this._data.TimeUsageWeekdays)
      .enter()
      .append("rect")
      .attr(
        "x",
        (d, i) =>
          this.config.paddingLeft + (i + 0.5) * bandwidth - barWidth / 2,
      )
      .attr("width", barWidth)
      .attr("y", (d) =>
        barType === "Empty"
          ? startPoint
          : barType === "UnderUtilised"
            ? startPoint + this.HeightGetter(d, "Empty")
            : barType === "Normal"
              ? startPoint +
                this.HeightGetter(d, "Empty") +
                this.HeightGetter(d, "UnderUtilised")
              : startPoint +
                this.HeightGetter(d, "Empty") +
                this.HeightGetter(d, "UnderUtilised") +
                this.HeightGetter(d, "Normal"),
      )
      .transition()
      .duration(700)
      .delay(100)
      .ease(d3.easeSinInOut)
      .attr("height", (d) => this.HeightGetter(d, barType))
      .attr(
        "fill",
        barType === "Normal"
          ? this.colorPalette.NormalColor
          : barType === "Empty"
            ? this.colorPalette.emptyColor
            : barType === "OverUtilised"
              ? this.colorPalette.OverUtilisedColor
              : this.colorPalette.underUtilisedColor,
      )
      .attr("class", (d, i) => `bar-${barType}-${i} bar-${barType}`);

    setTimeout(() => {
      this._onTransition = false;
    }, this.config.transitionDuration + this.config.transitionDelay);
  }

  private SetupGrid() {
    let bandwidth = this._xScaleFunction.bandwidth();
    d3.select(`#${this._id} svg`)
      .selectAll()
      .data(this._data.TimeUsageWeekdays)
      .enter()
      .append("line")
      .attr("x1", (d, i) => this.config.paddingLeft + (i + 1) * bandwidth)
      .attr("x2", (d, i) => this.config.paddingLeft + (i + 1) * bandwidth)
      .attr("y1", this.config.paddingTop)
      .attr("y2", this._chartHeight - this.config.paddingBottom)
      .attr("stroke", this.colorPalette.ticks)
      .style("stroke-dasharray", `6px`);
  }

  private DrawAverageLine() {
    let value =
      this._yScaleFunction(this._data.AverageTimeUsageHours) +
      this.config.paddingTop;
    d3.select(`#${this._id} svg`)
      .append("line")
      .attr("x1", this.config.paddingLeft + 10)
      .attr("x2", this._chartWidth - this.config.paddingRight)
      .attr("y1", value)
      .attr("y2", value)
      .attr("stroke", this.colorPalette.focusBorder)
      .style("stroke-dasharray", "6px")
      .attr("stroke-width", 2);

    d3.select(`#${this._id} svg`)
      .append("circle")
      .attr("cx", this.config.paddingLeft)
      .attr("cy", value)
      .attr("r", 5)
      .attr("fill", this.colorPalette.focusBorder);

    d3.select(`#${this._id} svg`)
      .append("rect")
      .attr("x", this.config.paddingLeft - 100)
      .attr("y", value - 17)
      .attr("width", 90)
      .attr("height", 35)
      .attr("fill", "white");

    d3.select(`#${this._id} svg`)
      .append("text")
      .attr("x", this.config.paddingLeft - 100)
      .attr("y", value + 3)
      .text(`Avg: ${formatHoursMinuts(this._data.AverageTimeUsageHoursStr)}`)
      .style("font-family", "Montserrat")
      .style("font-size", "13px")
      .attr("stroke", this.colorPalette.focusBorder);
  }

  private hoverEnterListener(d: TimeUsageWeekDaysDataType, barWidth: number) {
    if (this._onTransition) return;
    let thisIndex = this._data.TimeUsageWeekdays.findIndex(
      (x) => x.weekday === d.weekday,
    );

    for (let i = 0; i < this._data.TimeUsageWeekdays.length; i++) {
      if (i !== thisIndex) {
        d3.select(`#${this._id} .bar-Empty-${i}`)
          .transition()
          .style("opacity", this.config.opacityHover);
        d3.select(`#${this._id} .bar-OverUtilised-${i}`)
          .transition()
          .style("opacity", this.config.opacityHover);
        d3.select(`#${this._id} .bar-UnderUtilised-${i}`)
          .transition()
          .style("opacity", this.config.opacityHover);
        d3.select(`#${this._id} .bar-Normal-${i}`)
          .transition()
          .style("opacity", this.config.opacityHover);
      }
    }

    let infoContainerWidth = 190;
    let infoContainerHeight = 100;
    let isRight =
      thisIndex < Math.floor(this._data.TimeUsageWeekdays.length / 3);
    let currentBar = document.querySelector(
      `#${this._id} svg .handler-bars-${thisIndex}`,
    ) as HTMLElement;
    let upPos =
      (parseInt(currentBar.getAttribute("y") as string) +
        parseInt(currentBar.getAttribute("height") as string)) /
      2;

    let fractionSpace = this.config.infoTriangleWidth;
    let leftPos = parseInt(currentBar.getAttribute("x") as string) + barWidth;
    let rightPos = parseInt(currentBar.getAttribute("x") as string);

    let centerPos = upPos + infoContainerHeight / 2;

    d3.select(`#${this._id} svg`)
      .append("polygon")
      .attr(
        "points",
        `${isRight ? leftPos - fractionSpace : rightPos + fractionSpace},${centerPos} ${isRight ? leftPos : rightPos},${centerPos + fractionSpace} ${isRight ? leftPos : rightPos},${centerPos - fractionSpace}`,
      )
      .attr("class", `triangle-${thisIndex}`)
      .attr("fill", "white");

    d3.select(`#${this._id} svg`)
      .append("rect")
      .attr("y", upPos)
      .attr("x", isRight ? leftPos : rightPos - infoContainerWidth)
      .attr("width", infoContainerWidth)
      .attr("height", infoContainerHeight)
      .attr("fill", "white")
      .attr("class", `info-container-${thisIndex}`)
      .style("filter", "drop-shadow( rgba(1, 1, 1, 0.1) 0px 0px 2px")
      .attr("rx", 7)
      .attr("ry", 7);

    d3.select(`#${this._id} svg`)
      .append("text")
      .attr("x", isRight ? leftPos + 15 : rightPos - infoContainerWidth + 15)
      .attr("y", upPos + 25)
      .attr("class", `info-text-${thisIndex}`)
      .text(`Empty Use: ${formatHoursMinuts(d.EmptyHoursStr)}`)
      .style("font-family", "Montserrat")
      .style("font-weight", "bold")
      .style("font-size", "12px")
      .style("fill", this.colorPalette.emptyColor);

    d3.select(`#${this._id} svg`)
      .append("text")
      .attr("x", isRight ? leftPos + 15 : rightPos - infoContainerWidth + 15)
      .attr("y", upPos + 45)
      .attr("class", `info-text-${thisIndex}`)
      .text(`UnderUtilised Use: ${formatHoursMinuts(d.UnderUtilisedHoursStr)}`)
      .style("font-family", "Montserrat")
      .style("font-weight", "bold")
      .style("font-size", "12px")
      .style("fill", this.colorPalette.underUtilisedColor);

    d3.select(`#${this._id} svg`)
      .append("text")
      .attr("x", isRight ? leftPos + 15 : rightPos - infoContainerWidth + 15)
      .attr("y", upPos + 65)
      .attr("class", `info-text-${thisIndex}`)
      .text(`Normal Use: ${formatHoursMinuts(d.NormalHoursStr)}`)
      .style("font-family", "Montserrat")
      .style("font-weight", "bold")
      .style("font-size", "12px")
      .style("fill", this.colorPalette.NormalColor);

    d3.select(`#${this._id} svg`)
      .append("text")
      .attr("x", isRight ? leftPos + 15 : rightPos - infoContainerWidth + 15)
      .attr("y", upPos + 85)
      .attr("class", `info-text-${thisIndex}`)
      .text(`OverUtilised Use: ${formatHoursMinuts(d.OverUtilisedHoursStr)}`)
      .style("font-family", "Montserrat")
      .style("font-weight", "bold")
      .style("font-size", "12px")
      .style("fill", this.colorPalette.OverUtilisedColor);
  }

  private hoverLeaveListener(d: TimeUsageWeekDaysDataType) {
    if (this._onTransition) return;

    let thisIndex = this._data.TimeUsageWeekdays.findIndex(
      (x) => x.weekday === d.weekday,
    );

    for (let i = 0; i < this._data.TimeUsageWeekdays.length; i++) {
      if (i !== thisIndex) {
        d3.select(`#${this._id} .bar-Empty-${i}`)
          .transition()
          .style("opacity", 1);
        d3.select(`#${this._id} .bar-OverUtilised-${i}`)
          .transition()
          .style("opacity", 1);
        d3.select(`#${this._id} .bar-UnderUtilised-${i}`)
          .transition()
          .style("opacity", 1);
        d3.select(`#${this._id} .bar-Normal-${i}`)
          .transition()
          .style("opacity", 1);
      } else {
        d3.selectAll(`#${this._id} .info-container-${i}`).remove();
        d3.selectAll(`#${this._id} .triangle-${i}`).remove();
        d3.selectAll(`#${this._id} .info-text-${i}`).remove();
      }
    }
  }

  private DrawBarsListeners(): void {
    let bandwidth = this._xScaleFunction.bandwidth();
    let barWidth = bandwidth - this.config.EmptySpaceBetweenBars;

    d3.select(`#${this._id} svg`)
      .selectAll()
      .data(this._data.TimeUsageWeekdays)
      .enter()
      .append("rect")
      .attr(
        "x",
        (d, i) =>
          this.config.paddingLeft + (i + 0.5) * bandwidth - barWidth / 2,
      )
      .attr("width", barWidth)
      .attr(
        "y",
        this._yScaleFunction(this._data.WorkingHours) + this.config.paddingTop,
      )
      .attr(
        "height",
        this._chartHeight -
          (this.config.paddingBottom + this.config.paddingTop),
      )
      .attr("class", (d, i) => `handler-bars handler-bars-${i}`)
      .attr("fill", "rgba(0,0,0,0)")
      .style("cursor", "pointer")
      .on("mouseenter", (e, d) => {
        this.hoverEnterListener(d, barWidth);
      })
      .on("touchstart", (e, d) => {
        this.hoverEnterListener(d, barWidth);
      })
      .on("mouseleave", (e, d) => {
        this.hoverLeaveListener(d);
      })
      .on("touchend", (e, d) => {
        this.hoverLeaveListener(d);
      });
  }

  //public methods
  public DrawChart(): void {
    this.SetupLayout();
    this.SetupLegends();
    this.SetupScaleFunctions();
    this.SetupXAxis();
    this.SetupYAxis();
    this.DrawBars("Empty");
    this.DrawBars("UnderUtilised");
    this.DrawBars("Normal");
    this.DrawBars("OverUtilised");
    this.SetupGrid();
    this.DrawAverageLine();
    this.DrawBarsListeners();
  }

  public Destroy() {
    d3.select(`#${this._id}`).remove();
  }
}

export default ZoneAnalyticsChart;
