import axios from "axios"
import api, { apiCalendar } from "./api";
import { GetScheduleCalendarParams, ScheduleCalendar } from "@/lib/types";



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
    const { data } = await apiCalendar.get("/schedule/all?"+paramsS, {

    })

    // 🔁 Convertir LocalDateTime (string) → Date
    return data.map((ev: { id: any; title: any; dateStart: string; dateEnd: string; color: any; employeeID: any; }) => ({
        id: ev.id,
        title: ev.title,
        dateStart: new Date(ev.dateStart.replace(" ", "T")),
        dateEnd: new Date(ev.dateEnd.replace(" ", "T")),
        color: ev.color || "#0d6efd",   // Color por defecto si no se proporciona
        employeeID: ev.employeeID
    }));
  } catch (error) {
    console.error("Error fetching schedule calendar", error)
    throw error
  }
}