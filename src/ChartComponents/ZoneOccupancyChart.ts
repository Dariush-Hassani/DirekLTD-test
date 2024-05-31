import * as d3 from "d3";

class ZoneOccupancyChart {
  //public fields
  public colorPalette = {
    AverageColor: "#68CDDC",
    CapacityColor: "#51919B",
    PeakColor: "#111827",
    textThin: "#9CA3AF",
    textBold: "#6B7280",
    ticks: "#E5E7EB",
  };

  public config = {
    EmptySpaceBetweenBars: 50, //(px)
    marginTop: 20,
    marginLeft: 40,
    marginBottom: 0,
    marginRight: 0,
    paddingTop: 20,
    paddingLeft: 40,
    paddingBottom: 40,
    paddingRight: 0,
  };

  //private fields
  private _id: string;
  private _data: ZoneOccupancyDataType[];
  private _width: number;
  private _height: number;
  private _chartWidth: number;
  private _chartHeight: number;
  private _xScaleFunction: d3.ScaleBand<string> = d3.scaleBand();
  private _yScaleFunction: d3.ScaleLinear<number, number> = d3.scaleLinear();

  public constructor(
    id: string,
    data: ZoneOccupancyDataType[],
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
  }
  private SetupScaleFunctions(): void {
    this._xScaleFunction = d3
      .scaleBand()
      .domain(this._data.map((x) => x.Zone))
      .range([
        0,
        this._chartWidth - (this.config.paddingRight + this.config.paddingLeft),
      ]);

    let allCapacities = this._data.map((x) => x.Capacity);
    let allPeaks = this._data.map((x) => x.Peak);
    let maxCapacitiesAndPeaks = d3.max([
      ...allPeaks,
      ...allCapacities,
    ]) as number;
    maxCapacitiesAndPeaks = maxCapacitiesAndPeaks + maxCapacitiesAndPeaks * 0.2;

    this._yScaleFunction = d3
      .scaleLinear()
      .domain([maxCapacitiesAndPeaks, 0])
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
      // .style(
      //   "transform",
      //   `translate(0,${this._chartHeight - this.config.paddingBottom}px)`,
      // )
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
      .ticks(this._chartHeight / 50);
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

  private DrawBars(barType: "Capacity" | "Average"): void {
    let bandwidth = this._xScaleFunction.bandwidth();
    let barWidth = bandwidth - this.config.EmptySpaceBetweenBars;

    d3.select(`#${this._id} svg`)
      .selectAll()
      .data(this._data)
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
        (d, i) => this._yScaleFunction(d[barType]) + this.config.paddingTop,
      )
      .attr(
        "height",
        (d, i) =>
          this._chartHeight -
          (this.config.paddingBottom + this.config.paddingTop) -
          this._yScaleFunction(d[barType]),
      )
      .attr(
        "fill",
        barType === "Capacity"
          ? this.colorPalette.CapacityColor
          : this.colorPalette.AverageColor,
      )
      .attr(
        "class",
        (d, i) => `bar-${barType === "Average" ? "avg" : "cap"}-${i}`,
      )
      .attr("rx", 7)
      .attr("ry", 7);
  }

  private ModifyBottomRadius(): void {
    for (let i = 0; i < this._data.length; i++) {
      let avgHeightStr: string | null | undefined = document
        .querySelector(`#${this._id} svg .bar-avg-${i}`)
        ?.getAttribute("height");
      let avgHeight = avgHeightStr ? parseInt(avgHeightStr) : 0;

      let capHeightStr: string | null | undefined = document
        .querySelector(`#${this._id} svg .bar-cap-${i}`)
        ?.getAttribute("height");
      let capHeight = capHeightStr ? parseInt(capHeightStr) : 0;

      let rectHeight;
      let rectColor;
      let barType;
      if (avgHeight > 5) {
        rectHeight = 5;
        rectColor = this.colorPalette.AverageColor;
        barType = "avg";
      } else if (avgHeight) {
        rectHeight = avgHeight;
        rectColor = this.colorPalette.AverageColor;
        barType = "avg";
      } else if (capHeight > 5) {
        rectHeight = 5;
        rectColor = this.colorPalette.CapacityColor;
        barType = "cap";
      } else if (capHeight) {
        rectHeight = capHeight;
        rectColor = this.colorPalette.CapacityColor;
        barType = "cap";
      } else {
        //nothing
      }
      if (rectHeight && rectColor && barType) {
        let refRect = document.querySelector(
          `#${this._id} svg .bar-${barType}-${i}`,
        ) as HTMLElement;
        d3.select(`#${this._id} svg`)
          .append("rect")
          .attr("x", refRect.getAttribute("x"))
          .attr(
            "y",
            this._chartHeight - (this.config.paddingBottom + rectHeight),
          )
          .attr("width", refRect.getAttribute("width"))
          .attr("height", rectHeight)
          .attr("fill", rectColor);
      }
    }
  }

  private DrawPeaks(): void {
    let bandwidth = this._xScaleFunction.bandwidth();
    let barWidth = bandwidth - this.config.EmptySpaceBetweenBars;

    d3.select(`#${this._id} svg`)
      .selectAll()
      .data(this._data)
      .enter()
      .append("line")
      .attr(
        "x1",
        (d, i) =>
          this.config.paddingLeft + (i + 0.5) * bandwidth - barWidth / 2 - 3,
      )
      .attr(
        "x2",
        (d, i) =>
          this.config.paddingLeft +
          (i + 0.5) * bandwidth -
          barWidth / 2 +
          barWidth +
          3,
      )
      .attr("width", barWidth)
      .attr(
        "y1",
        (d, i) => this._yScaleFunction(d.Peak) + this.config.paddingTop,
      )
      .attr(
        "y2",
        (d, i) => this._yScaleFunction(d.Peak) + this.config.paddingTop,
      )
      .attr("stroke", this.colorPalette.PeakColor)
      .attr("stroke-width", "2px")
      .attr("stroke-dasharray", "5");
  }

  //public methods
  public DrawChart(): void {
    this.SetupLayout();
    this.SetupScaleFunctions();
    this.SetupXAxis();
    this.SetupYAxis();
    this.DrawBars("Capacity");
    this.DrawBars("Average");
    this.ModifyBottomRadius();
    this.DrawPeaks();
  }

  public ChangeDimension(width: number, height: number): void {
    this._chartWidth =
      width - (this.config.marginLeft + this.config.marginRight);
    this._chartHeight =
      height - (this.config.marginBottom + this.config.marginTop);
    this._width = width;
    this._height = height;
    this.DrawChart();
  }
}
export default ZoneOccupancyChart;
