import Link from 'next/link';
import { Home } from 'lucide-react';
//import { timeEntries, users } from '@/lib/mock-data';
import { TimeEntriesTable } from './_components/time-entries-table';
import { HoursChart } from './_components/hours-chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TimeEntry, User } from '@/lib/types';
import { getAllEmployees } from '@/services/user.service';
import { getWorkHours } from '@/services/ponches.service';
import { DashboardGate } from './_components/DashboardGate';
import { PTORequestsTable } from './_components/pto-requests-table';
import { getAllPTO } from '@/services/pto.service';

export const dynamic = "force-dynamic";
// In a real app, this would be an API call
async function getDashboardData() {
  
  return {
    timeEntries: await getWorkHours(),
    users: await getAllEmployees(),
    ptoRequests:await getAllPTO(),
  };
}

export default async function DashboardPage() {
 
  const timeEntries = await getWorkHours();
   const users = await getAllEmployees();
   const ptoRequests = await getAllPTO();
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-2xl font-semibold">Timecard Reports</h1>
          <Link href="/" className="ml-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <Home className="h-4 w-4" />
            <span>Clock-In Station</span>
          </Link>
        </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <DashboardGate> 
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Hours Worked by User</CardTitle>
                    <CardDescription>Total hours logged for the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HoursChart timeEntries={timeEntries} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Clock-Ins</CardTitle>
                    <CardDescription>A list of the most recent time entries.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TimeEntriesTable timeEntries={timeEntries.slice(0, 5)} />
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>PTO Requests</CardTitle>
                <CardDescription>Manage pending Paid Time Off requests.</CardDescription>
            </CardHeader>
            <CardContent>
                <PTORequestsTable ptoRequests={ptoRequests} />
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>All Time Entries</CardTitle>
            <CardDescription>
              A comprehensive log of all time entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeEntriesTable timeEntries={timeEntries} useFilters={true} />
          </CardContent>
        </Card>
        </DashboardGate>
      </main>
    </div>
  );
}


