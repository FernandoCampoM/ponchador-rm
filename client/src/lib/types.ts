export interface User {
  pin?: string;
  avatarUrl?: string;
  numPonches?: number;
  ID: string;
  Name: string;
  Active: "S" | "N";
  Acces: Number;
}

export interface TimeEntry {
  punchId: string;
  userId: string;
  userName: string;
  clockIn: Date;
  clockOut?: Date;
  minutesWorked?: number;
  isOrphan?: boolean;
}
export interface ValidateUserResponse {
  success: boolean;
  message: string;
  user?: User;
}
export interface ClockRequest {
  UserID: number;
  image?: string;       // base64 opcional
  debugInfo?: unknown;  // opcional
}
export interface ClockResponse {
  success: boolean;
  action?: "Clock In" | "Clock Out";
  timestamp?: string;
  message: string;
}
export interface GetWorkHoursParams {
  userId?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}
export interface ScheduleCalendar {
  id: number
  title: string
  dateStart: Date
  dateEnd: Date
  color: string
  employeeID: number
}
export interface GetScheduleCalendarParams {
  employeeId?: number
  startDate?: string // yyyy-MM-dd
  endDate?: string   // yyyy-MM-dd
}
export interface PTORequest {
  createdAt?: string | number | Date;
  id?: number;
  userId: string;
  userName: string;
  startDate: Date;
  endDate: Date;
  status: 'requested' | 'approved' | 'denied';
  statusChanged: boolean; // To track if notification has been seen
}