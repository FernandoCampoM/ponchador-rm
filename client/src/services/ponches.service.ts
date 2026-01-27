import { GetWorkHoursParams, TimeEntry } from "@/lib/types";
import api, { apiServer } from "./api";




export const getWorkHours = async (
  params?: GetWorkHoursParams
): Promise<TimeEntry[]> => {
  try {
    const { data } = await apiServer.get<TimeEntry[]>("/GetWorkHours", {
      params: {
        UserID: params?.userId,
        StartDate: params?.startDate,
        EndDate: params?.endDate,
      },
    });
    
    // Convertir strings a Date (MUY IMPORTANTE)
    const date = new Date((data[0].clockIn as unknown as string).replace('T', ' ').replace('Z', ''));
    console.log("Raw time entries data:", date);
    console.log("Type of clockIn:", typeof date);
    return data.map((entry) => ({
      ...entry,
      clockIn: new Date((entry.clockIn as unknown as string).replace('T', ' ').replace('Z', '')),
      clockOut: entry.clockOut
        ? new Date((entry.clockOut as unknown as string).replace('T', ' ').replace('Z', ''))
        : undefined,
    }));

  } catch (error) {
    console.error("Error fetching work hours", error);
    throw error;
  }
};