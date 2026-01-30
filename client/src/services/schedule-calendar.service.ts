import axios from "axios"
import api, { apiServer } from "./api";
import { GetScheduleCalendarParams, ScheduleCalendar } from "@/lib/types";

/**
 * Convierte un string "yyyy-MM-dd HH:mm:ss" a Date 
 * sin aplicar conversiones de zona horaria local.
 */
const parseRawDate = (dateStr: string): Date => {
  const [datePart, timePart] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  console.log("Parsing date:", datePart, "time:", timePart);
  const [hour, minute, second] = timePart.split(':').map(Number);

  // El mes en JS es 0-indexado (0 = Enero, 11 = Diciembre)
  return new Date(year, month - 1, day, hour, minute, second || 0);
};

export const getScheduleCalendar = async (
  params?: GetScheduleCalendarParams
): Promise<ScheduleCalendar[]> => {
  try {
    let paramsS="employeeId="+(params?.employeeId || "");
    if(params?.startDate){
      paramsS+="&startDate="+params.startDate;
    }
    if(params?.endDate){
        paramsS+="&endDate="+params.endDate;
    }
    const { data } = await apiServer.get("/schedule/all?"+paramsS, {

    })
    console.log("Fetched schedule calendar data:", data);
    // 🔁 Convertir LocalDateTime (string) → Date
    return data.map((ev: { id: any; title: any; dateStart: string; dateEnd: string; color: any; employeeID: any; }) => ({
        id: ev.id,
        title: ev.title,
        dateStart: parseRawDate(ev.dateStart),
        dateEnd: parseRawDate(ev.dateEnd),
        color: ev.color || "#0d6efd",   // Color por defecto si no se proporciona
        employeeID: ev.employeeID
    }));
  } catch (error) {
    console.error("Error fetching schedule calendar", error)
    throw error
  }
}