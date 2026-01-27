"use client"

import { CalendarDays, Clock, Home } from "lucide-react"
import Link from "next/link"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { getScheduleCalendar } from "@/services/schedule-calendar.service"
import { useEffect, useState } from "react"
import { ScheduleCalendar, User } from "@/lib/types"
import type { EventContentArg, EventInput } from "@fullcalendar/core"
import { getAllEmployees, validateUser } from "@/services/user.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeEntriesTable } from "../dashboard/_components/time-entries-table"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"


export const dynamic = "force-dynamic";
const toDate = (d: string) => new Date(d.replace(" ", "T"))

const formatTime = (d: Date) =>
  d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })

const formatDay = (d: string) => {
  const [year, month, day] = d.split("-").map(Number)

  return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}


const diffMinutes = (a: Date, b: Date) =>
  Math.max(0, (b.getTime() - a.getTime()) / 60000)
const getWeekKey = (date: Date) => {
  const firstDay = new Date(date)
  const day = firstDay.getDay() || 7
  firstDay.setDate(firstDay.getDate() - day + 1)
  firstDay.setHours(0, 0, 0, 0)
  return firstDay.toISOString().split("T")[0]
}

/* ------------------ grouping logic ------------------ */


function getNameUser(employees: User[], employeeID: string): string {
  const employee = employees.find(emp => emp.ID === employeeID);
  return employee ? `${employee.Name}` : "Desconocido";
}
export default function ScheduledShiftsPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(true)
const [userId, setUserId] = useState("")
const [pin, setPin] = useState("")
const [currentUser, setCurrentUser] = useState<User | null>(null)
const { toast } = useToast()
  const [shifts, setShifts] = useState<ScheduleCalendar[]>([])
  const [employees, setEmployees] = useState<User[]>([]);
useEffect(() => {
  if (!currentUser) return
  console.log("Cargando turnos para el usuario:", currentUser.ID);
  getScheduleCalendar({ employeeId: Number(currentUser.ID) })
    .then((data) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcoming = data.filter((item) => {
        const start = new Date(item.dateStart)
        start.setHours(0, 0, 0, 0)
        return start >= today
      })
      setShifts(upcoming);
    })
    .catch(console.error)
}, [currentUser])
useEffect(() => {
  getAllEmployees()
    .then((data) => {
      setEmployees(data);
    })
    .catch(console.error)
}, [])


const groupedByDay = shifts.reduce((acc: Record<string, ScheduleCalendar[]>, s) => {
  const day = s.dateStart.toISOString().split("T")[0]
  acc[day] = acc[day] || []
  acc[day].push(s)
  return acc
}, {})
  const todayKey = new Date().toISOString().split("T")[0]
  const todayShifts = groupedByDay[todayKey] || []

  const todayRange =
    todayShifts.length > 0
      ? {
          start: formatTime(todayShifts[0].dateStart),
          end: formatTime(todayShifts[todayShifts.length - 1].dateEnd),
        }
      : null
      const currentWeekKey = getWeekKey(new Date())

const weeklyMinutes = shifts.reduce((total, s) => {
  const shiftDate = s.dateStart
  return getWeekKey(shiftDate) === currentWeekKey
    ? total + diffMinutes(s.dateStart, s.dateEnd)
    : total
}, 0)

const handleValidate = async () => {
  const response = await validateUser(Number(userId), pin)

  if (!response.success) {
    toast({
      variant: "destructive",
      title: response.message,
    })
    return
  }
  if (response.user) {
    setCurrentUser(response.user)
    setIsAuthOpen(false)
  }
}
  return (
    <>
    <Dialog open={isAuthOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Ver turnos programados</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <Label>User ID</Label>
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      <div>
        <Label>PIN</Label>
        <Input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
      </div>

      <Button className="w-full" onClick={handleValidate}>
        Ingresar
      </Button>
    </div>
  </DialogContent>
</Dialog>
  {currentUser && (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      
      
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-2xl font-semibold">Scheduled Shifts</h1>
          <Link href="/" className="ml-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <Home className="h-4 w-4" />
            <span>Clock-In Station</span>
          </Link>
        </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
          <Card>
                <CardHeader>
                    <CardTitle>{currentUser?.Name}</CardTitle>
                    <CardDescription>This are your scheduled shifts</CardDescription>
                </CardHeader>
                <CardContent>
        <div className="space-y-6">

            {/* 🔔 TODAY CARD */}
            <div className="rounded-xl border bg-green-50 p-4 text-sm">
              <div className="flex items-center gap-2 font-medium text-green-700">
                <Clock className="h-4 w-4" />
                Hoy trabajas
              </div>

              <div className="mt-1 text-green-800">
                {todayRange
                  ? `${todayRange.start} – ${todayRange.end}`
                  : "Hoy no tienes turnos asignados"}
              </div>
            </div>
            <div className="rounded-xl border bg-blue-50 p-4 text-sm">
            <div className="font-medium text-blue-700">
              🧮 Total esta semana
            </div>

            <div className="mt-1 text-blue-900">
              {Math.floor(weeklyMinutes / 60)}h {weeklyMinutes % 60}min
            </div>
          </div>

            {/* 📅 AGENDA */}
            <div className="space-y-8">
              {Object.entries(groupedByDay)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, dayShifts]) => {
                  const ordered = dayShifts.sort(
                    (a, b) => a.dateStart.getTime() - b.dateStart.getTime()
                  )

                  let totalMinutes = 0
                  const gaps: number[] = []

                  ordered.forEach((s, i) => {
                    totalMinutes += diffMinutes(s.dateStart, s.dateEnd)

                    if (i > 0) {
                      const gap = diffMinutes(
                        ordered[i - 1].dateEnd,
                        s.dateStart
                      )
                      if (gap > 0) gaps.push(gap)
                    }
                  })

                  return (
                    <section key={day} className="space-y-3">
                      <div className="flex items-center gap-2 font-semibold capitalize">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {
                        formatDay(day)}
                      </div>

                      <div className="space-y-2">
                        {ordered.map(s => (
                          <div
                            key={s.id}
                            className="flex justify-between rounded-lg border bg-background p-3 text-sm"
                          >
                            <span className="font-medium">
                              {formatTime(s.dateStart)} – {formatTime(s.dateEnd)}
                            </span>
                            <span className="text-muted-foreground">{s.title}</span>
                          </div>
                        ))}
                      </div>

                      {/* ⏱ TOTAL */}
                      <div className="text-xs text-muted-foreground">
                        ⏱ {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}min trabajados
                      </div>

                      {/* 🟡 GAPS */}
                      {gaps.length > 0 && (
                        <div className="text-xs text-yellow-600">
                          🟡 Pausas: {gaps.map(g => `${g} min`).join(" · ")}
                        </div>
                      )}
                    </section>
                  )
                })}
            </div>
          </div>
          </CardContent>
            </Card>
          </div>
          </main>
    </div>
              )} 
              </>
  )
}
