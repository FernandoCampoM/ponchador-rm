"use client"
import {

  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { TimeEntry } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, ImageIcon, X } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { urlServer } from "@/services/api"
import { get } from "http"
import { EvidenceImage } from "./EvidenceImage"
function getEvidenceUrl(userId: string, timestamp: Date): string {
  const yyyy = timestamp.getFullYear();
  const mm = String(timestamp.getMonth() + 1).padStart(2, '0');
  const dd = String(timestamp.getDate()).padStart(2, '0');
  const hh = String(timestamp.getHours()).padStart(2, '0');
  const min = String(timestamp.getMinutes()).padStart(2, '0');
  const ss = String(timestamp.getSeconds()).padStart(2, '0');

  const timeStr = `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
  const filename = `${userId}_${timeStr}.jpg`;
  return `${urlServer}/files/${filename}`;
}

interface TimeEntriesTableProps {
  timeEntries: TimeEntry[];
  useFilters?: boolean;
}

function formatDuration(start: Date, end?: Date): string {
  if (!end) return '-';
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}
function DatePicker({
  date,
  setDate,
  label,
}: {
  date?: Date
  setDate: (date?: Date) => void
  label: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[180px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy-MM-dd") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}



export function TimeEntriesTable({ timeEntries, useFilters = false }: TimeEntriesTableProps) {
  const [search, setSearch] = useState("")
  const [fromDate, setFromDate] = useState<Date | undefined>()
const [toDate, setToDate] = useState<Date | undefined>()
  const clearFilters = () => {
  setSearch("")
  setFromDate(undefined)
  setToDate(undefined)
}

  const filteredEntries = timeEntries.filter((entry) => {
  const searchValue = search.toLowerCase()

  const matchesUser =
    entry.userName.toLowerCase().includes(searchValue) ||
    entry.userId==searchValue

  const clockInDate = new Date(entry.clockIn)

  const matchesFromDate =
    !fromDate || clockInDate >= fromDate

  const matchesToDate =
    !toDate ||
    clockInDate <= new Date(
      toDate.setHours(23, 59, 59, 999)
    )

  return matchesUser && matchesFromDate && matchesToDate
})


  return (
    <div className="space-y-4">
      {useFilters && (
      <div className="flex flex-wrap items-end gap-4">
  <Input
    placeholder="Buscar por nombre o ID"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="max-w-sm"
  />

  <DatePicker
    date={fromDate}
    setDate={setFromDate}
    label="Desde"
  />

  <DatePicker
    date={toDate}
    setDate={setToDate}
    label="Hasta"
  />

  <Button
    variant="ghost"
    onClick={clearFilters}
    className="flex items-center gap-2"
  >
    <X className="h-4 w-4" />
    Limpiar
  </Button>
</div>      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Evidencia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEntries.map((entry) => (
            <TableRow key={entry.punchId}>
              <TableCell className="font-medium">{entry.userName}</TableCell>
              <TableCell>{entry.clockIn.toLocaleString()}</TableCell>
              <TableCell>
                {entry.clockOut ? entry.clockOut.toLocaleString() : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                {formatDuration(entry.clockIn, entry.clockOut)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={entry.clockOut ? "secondary" : "default"}
                  className={
                    !entry.clockOut
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }
                >
                  {entry.clockOut ? "Completed" : "In Progress"}
                </Badge>
              </TableCell>
              <TableCell>
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon">
        <ImageIcon className="h-5 w-5" />
      </Button>
    </DialogTrigger>

    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Evidencias de marcación</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ENTRADA */}
        <div className="space-y-2">
          <p className="font-semibold text-sm text-muted-foreground">
            Evidencia de entrada
          </p>
          <EvidenceImage
  src={getEvidenceUrl(entry.userId, entry.clockIn)}
  alt="Evidencia de entrada"
/>
        </div>

        {/* SALIDA */}
        <div className="space-y-2">
          <p className="font-semibold text-sm text-muted-foreground">
            Evidencia de salida
          </p>

          {entry.clockOut ? (
  <EvidenceImage
    src={getEvidenceUrl(entry.userId, entry.clockOut)}
    alt="Evidencia de salida"
  />
) : (
  <p className="text-sm text-muted-foreground italic">
    Aún no registrada
  </p>
)}
        </div>
      </div>
    </DialogContent>
  </Dialog>
</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
