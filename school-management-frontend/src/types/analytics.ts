export interface AnalyticsDay {
  date: string;
  present: number;
  absent: number;
}

export interface AnalyticsOverview {
  totalStudents: number;
  totalTeachers: number;
  activeBuses: number;
  driversOnline: number;
  tripsTotal: number;
  tripsCompleted: number;
  onTimePercent: number;
  studentsTransported: number;
  feesInvoiced: number;
  feesCollected: number;
  feesOutstanding: number;
  examAveragePercent: number;
  attendanceTrend: AnalyticsDay[];
}
