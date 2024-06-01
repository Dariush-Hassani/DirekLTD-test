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
    focusBorder: "#00A9C2",
  };

  public config = {
    EmptySpaceBetweenBars: 50, //(px)
    marginTop: 0,
    marginLeft: 0,
    marginBottom: 0,
    marginRight: 0,
    paddingTop: 120,
    paddingLeft: 100,
    paddingBottom: 40,
    paddingRight: 0,
    opacityHover: 0.6,
    focusBorderEmptySpace: 8,
    infoTriangleWidth: 8,
    transitionDuration: 1000,
    transitionDelay: 100,
  };

  public ChangeStateCallBack: any;

  //private fields
  private readonly _id: string;
  private _data: ZoneOccupancyDataType[];
  private _width: number;
  private _height: number;
  private _chartWidth: number;
  private _chartHeight: number;
  private _xScaleFunction: d3.ScaleBand<string> = d3.scaleBand();
  private _yScaleFunction: d3.ScaleLinear<number, number> = d3.scaleLinear();
  private _onTransition: boolean = false;

  public constructor(
    id: string,
    data: ZoneOccupancyDataType[],
    width: number,
    height: number,
    changeStateCallBack: any,
  ) {
    this._id = id;
    this._data = data;
    this._width = width;
    this._height = height;
    this._chartWidth =
      width - (this.config.marginLeft + this.config.marginRight);
    this._chartHeight =
      height - (this.config.marginBottom + this.config.marginTop);
    this.ChangeStateCallBack = changeStateCallBack;
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
      .text("Zone Occupancy")
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
      .attr("fill", this.colorPalette.AverageColor);

    d3.select(`#${this._id} svg .legend`)
      .append("text")
      .text("Average")
      .attr("y", "61")
      .attr("x", "27")
      .style("font-family", "Montserrat")
      .style("fill", this.colorPalette.textBold)
      .style("font-size", "16px")
      .style("font-weight", "600");

    d3.select(`#${this._id} svg .legend`)
      .append("circle")
      .attr("cy", "55")
      .attr("cx", "120")
      .attr("r", "10")
      .attr("fill", this.colorPalette.CapacityColor);

    d3.select(`#${this._id} svg .legend`)
      .append("text")
      .text("Capacity")
      .attr("y", "61")
      .attr("x", "136")
      .style("font-family", "Montserrat")
      .style("fill", this.colorPalette.textBold)
      .style("font-size", "16px")
      .style("font-weight", "600");

    d3.select(`#${this._id} svg .legend`)
      .append("line")
      .attr("y1", "55")
      .attr("y2", "55")
      .attr("x1", "230")
      .attr("x2", "290")
      .attr("r", "10")
      .style("stroke-width", "2")
      .style("stroke-dasharray", "4")
      .attr("stroke", this.colorPalette.PeakColor);

    d3.select(`#${this._id} svg .legend`)
      .append("text")
      .text("Peak")
      .attr("y", "61")
      .attr("x", "300")
      .style("font-family", "Montserrat")
      .style("fill", this.colorPalette.textBold)
      .style("font-size", "16px")
      .style("font-weight", "600");
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
    let yAxis = d3.axisRight(this._yScaleFunction).tickSize(tickSize).ticks(7);
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

    let ySpaceName = (
      document.querySelector(
        `#${this._id} svg .xAxis .tick text`,
      ) as HTMLElement
    ).getAttribute("y") as string;

    d3.select(`#${this._id} svg .yAxis`)
      .append("text")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Montserrat")
      .attr("y", parseInt(ySpaceName) + 25)
      .text("space names")
      .attr("x", -this.config.paddingLeft + 10)
      .style("transform", `translate(0,0)`)
      .attr("fill", this.colorPalette.textThin);
  }

  private DrawBars(barType: "Capacity" | "Average"): void {
    this._onTransition = true;
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
        (d) => this._yScaleFunction(d[barType]) + this.config.paddingTop,
      )
      .transition()
      .duration(this.config.transitionDuration)
      .delay(this.config.transitionDelay)
      .ease(d3.easeSinInOut)
      .attr(
        "height",
        (d) =>
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
        (d, i) =>
          `bar-${barType === "Average" ? "avg" : "cap"}-${i} bar-${barType === "Average" ? "avg" : "cap"}`,
      )
      .attr("rx", 7)
      .attr("ry", 7);

    setTimeout(() => {
      this._onTransition = false;
    }, this.config.transitionDuration + this.config.transitionDelay);
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
          this.config.paddingLeft + (i + 0.5) * bandwidth - barWidth / 2 - 10,
      )
      .attr(
        "x2",
        (d, i) =>
          this.config.paddingLeft +
          (i + 0.5) * bandwidth -
          barWidth / 2 +
          barWidth +
          10,
      )

      .attr("width", barWidth)

      .attr("y1", (d) => this._yScaleFunction(d.Peak) + this.config.paddingTop)
      .attr("y2", (d) => this._yScaleFunction(d.Peak) + this.config.paddingTop)
      .attr("stroke", this.colorPalette.PeakColor)
      .attr("stroke-width", "2px")
      .attr("class", (d, i) => `bar-peak-${i} bar-peak`)
      .attr("stroke-dasharray", "4");
  }

  private hoverEnterListener(
    d: ZoneOccupancyDataType,
    barWidth: number,
    bandwidth: number,
  ) {
    if (this._onTransition) return;
    let thisIndex = this._data.findIndex((x) => x.Zone === d.Zone);

    d3.select(`#${this._id} svg`)
      .append("rect")
      .attr(
        "x",
        this.config.paddingLeft +
          (thisIndex + 0.5) * bandwidth -
          barWidth / 2 -
          this.config.focusBorderEmptySpace,
      )
      .attr("width", barWidth + this.config.focusBorderEmptySpace * 2)
      .attr(
        "y",
        this._yScaleFunction(this._data[thisIndex].Capacity) +
          this.config.paddingTop -
          this.config.focusBorderEmptySpace,
      )
      .attr(
        "height",
        this._chartHeight -
          (this.config.paddingBottom + this.config.paddingTop) -
          this._yScaleFunction(this._data[thisIndex].Capacity) +
          this.config.focusBorderEmptySpace * 2,
      )
      .attr("stroke", this.colorPalette.focusBorder)
      .attr("stroke-width", "2px")
      .attr("class", `focus-border-${thisIndex} focus-border`)
      .attr("fill", "none")
      .attr("rx", "7")
      .attr("ry", "7")
      .style("opacity", "0")
      .transition()
      .style("opacity", "1");

    for (let i = 0; i < this._data.length; i++) {
      if (i !== thisIndex) {
        d3.select(`#${this._id} .bar-peak-${i}`)
          .transition()
          .style("opacity", this.config.opacityHover);
        d3.selectAll(`#${this._id} .bar-avg-${i}`)
          .transition()
          .style("opacity", this.config.opacityHover);
        d3.selectAll(`#${this._id} .bar-cap-${i}`)
          .transition()
          .style("opacity", this.config.opacityHover);
      }
    }

    let infoContainerWidth = 200;
    let infoContainerHeight = 100;
    let isRight = thisIndex < Math.floor(this._data.length / 2);
    let fractionSpace = this.config.EmptySpaceBetweenBars / 3;
    let fractionSpaceY = 1;
    let currentBar = document.querySelector(
      `#${this._id} svg .bar-cap-${thisIndex}`,
    ) as HTMLElement;
    let upPos =
      this._chartHeight -
      this.config.paddingBottom -
      parseInt(currentBar.getAttribute("height") as string) +
      fractionSpaceY -
      infoContainerHeight;

    let leftPos = parseInt(currentBar.getAttribute("x") as string);
    let rightPos = parseInt(currentBar.getAttribute("x") as string) + barWidth;
    let centerPos =
      parseInt(currentBar.getAttribute("x") as string) + barWidth / 2;

    d3.select(`#${this._id} svg`)
      .append("polygon")
      .attr(
        "points",
        `${centerPos - this.config.infoTriangleWidth},${upPos + infoContainerHeight - 1} ${centerPos + this.config.infoTriangleWidth},${upPos + infoContainerHeight - 1} ${centerPos},${upPos + infoContainerHeight + this.config.infoTriangleWidth}`,
      )
      .attr("class", `triangle-${thisIndex}`)
      .attr("fill", "white");

    d3.select(`#${this._id} svg`)
      .append("rect")
      .attr("y", upPos)
      .attr(
        "x",
        isRight
          ? leftPos - fractionSpace
          : rightPos - infoContainerWidth + fractionSpace,
      )
      .attr("width", infoContainerWidth)
      .attr("height", infoContainerHeight)
      .attr("fill", "white")
      .attr("class", `info-container-${thisIndex}`)
      .style("filter", "drop-shadow( -3px -1px 10px rgba(1, 1, 1, .1))")
      .attr("rx", 7)
      .attr("ry", 7);

    d3.select(`#${this._id} svg`)
      .append("text")
      .attr(
        "x",
        isRight
          ? leftPos - fractionSpace + 15
          : rightPos - infoContainerWidth + fractionSpace + 15,
      )
      .attr("y", upPos + 25)
      .attr("class", `info-text-${thisIndex}`)
      .text("*Click and see details.")
      .style("font-family", "Montserrat")
      .style("font-weight", "bold")
      .style("font-size", "14px")
      .style("fill", this.colorPalette.textBold);

    d3.select(`#${this._id} svg`)
      .append("text")
      .attr(
        "x",
        isRight
          ? leftPos - fractionSpace + 15
          : rightPos - infoContainerWidth + fractionSpace + 15,
      )
      .attr("y", upPos + 45)
      .attr("class", `info-text-${thisIndex}`)
      .text(`Average: ${this._data[thisIndex].Average.toFixed(2)}`)
      .style("font-family", "Montserrat")
      .style("font-weight", "bold")
      .style("font-size", "14px")
      .style("fill", this.colorPalette.AverageColor);

    d3.select(`#${this._id} svg`)
      .append("text")
      .attr(
        "x",
        isRight
          ? leftPos - fractionSpace + 15
          : rightPos - infoContainerWidth + fractionSpace + 15,
      )
      .attr("y", upPos + 65)
      .attr("class", `info-text-${thisIndex}`)
      .text(`Capacity: ${this._data[thisIndex].Capacity.toFixed(0)} occupant`)
      .style("font-family", "Montserrat")
      .style("font-weight", "bold")
      .style("font-size", "14px")
      .style("fill", this.colorPalette.CapacityColor);

    d3.select(`#${this._id} svg`)
      .append("text")
      .attr(
        "x",
        isRight
          ? leftPos - fractionSpace + 15
          : rightPos - infoContainerWidth + fractionSpace + 15,
      )
      .attr("y", upPos + 85)
      .attr("class", `info-text-${thisIndex}`)
      .text(`Peak: ${this._data[thisIndex].Peak.toFixed(0)}`)
      .style("font-family", "Montserrat")
      .style("font-weight", "bold")
      .style("font-size", "14px")
      .style("fill", this.colorPalette.PeakColor);
  }

  private hoverLeaveListener(d: ZoneOccupancyDataType) {
    if (this._onTransition) return;

    let thisIndex = this._data.findIndex((x) => x.Zone === d.Zone);

    for (let i = 0; i < this._data.length; i++) {
      if (i !== thisIndex) {
        d3.select(`#${this._id} .bar-peak-${i}`)
          .transition()
          .style("opacity", 1);
        d3.selectAll(`#${this._id} .bar-avg-${i}`)
          .transition()
          .style("opacity", 1);
        d3.selectAll(`#${this._id} .bar-cap-${i}`)
          .transition()
          .style("opacity", 1);
      } else {
        d3.selectAll(`#${this._id} .focus-border-${i}`).remove();
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
        (d) => this._yScaleFunction(d.Capacity) + this.config.paddingTop,
      )
      .attr(
        "height",
        (d) =>
          this._chartHeight -
          (this.config.paddingBottom + this.config.paddingTop) -
          this._yScaleFunction(d.Capacity),
      )
      .attr("class", "handler-bars")
      .attr("fill", "rgba(0,0,0,0)")
      .style("cursor", "pointer")
      .on("mouseenter", (e, d) => {
        this.hoverEnterListener(d, barWidth, bandwidth);
      })
      .on("touchstart", (e, d) => {
        this.hoverEnterListener(d, barWidth, bandwidth);
      })
      .on("mouseleave", (e, d) => {
        this.hoverLeaveListener(d);
      })
      .on("click", (e, d) => {
        if (this.ChangeStateCallBack) this.ChangeStateCallBack(d.Zone);
      });
  }

  //public methods
  public DrawChart(): void {
    this.SetupLayout();
    this.SetupLegends();
    this.SetupScaleFunctions();
    this.SetupXAxis();
    this.SetupYAxis();
    this.DrawBars("Capacity");
    this.DrawBars("Average");
    setTimeout(
      () => this.ModifyBottomRadius(),
      this.config.transitionDuration + this.config.transitionDelay,
    );
    this.DrawPeaks();
    this.DrawBarsListeners();
  }

  public Destroy() {
    d3.selectAll(`#${this._id} svg .handler-bars`)
      .on("mouseenter", null)
      .on("mouseleave", null)
      .on("touchstart", null)
      .on("touchend", null);
    d3.selectAll(`#${this._id}`).remove();
  }
}
export default ZoneOccupancyChart;
