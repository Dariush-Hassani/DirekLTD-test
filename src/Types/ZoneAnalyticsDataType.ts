export type TimeUsageWeekDaysDataType = {
  weekday: number;
  weekdayName: string;
  EmptyHours: number;
  EmptyHoursStr: string;
  UnderUtilisedHours: number;
  UnderUtilisedHoursStr: string;
  NormalHours: number;
  NormalHoursStr: string;
  OverUtilisedHours: number;
  OverUtilisedHoursStr: string;
};
type ZoneAnalyticsDataType = {
  WorkingHours: number;
  AverageTimeUsageHours: number;
  AverageTimeUsageHoursStr: string;
  TimeUsageWeekdays: TimeUsageWeekDaysDataType[];
};

export default ZoneAnalyticsDataType;
