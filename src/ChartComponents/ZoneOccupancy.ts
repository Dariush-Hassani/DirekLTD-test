class ZoneOccupancy {
  private _id: string;
  private _data: ZoneOccupancyDataType[];
  private _width: number;
  private _height: number;
  private _xScaleFunction: any;
  private _yScaleFunction: any;

  public colorPalette = {
    AverageColor: "#68CDDC",
    CapacityColor: "#51919B",
    PeakColor: "#111827",
    textThin: "#9CA3AF",
    textBold: "#6B7280",
    ticks: "#E5E7EB",
  };
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
  }

  public ChangeDimension(width: number, height: number): void {}
  public DrawChart() {}
}
export default ZoneOccupancy;
