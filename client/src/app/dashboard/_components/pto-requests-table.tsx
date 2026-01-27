"use client"

import { useActionState, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PTORequest } from "@/lib/types"
import { handlePTOAction } from "@/app/actions"
import React from "react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface PTORequestsTableProps {
  ptoRequests: PTORequest[];
}

const ITEMS_PER_PAGE = 5;

function StatusBadge({ status }: { status: PTORequest['status'] }) {
  const variant = {
    requested: 'default',
    approved: 'secondary',
    denied: 'destructive'
  }[status] as "default" | "secondary" | "destructive";

  const className = {
    requested: 'bg-accent text-accent-foreground',
    approved: 'bg-green-600 text-white',
    denied: ''
  }[status];

  return (
    <Badge variant={variant} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function PTORequestsTable({ ptoRequests }: PTORequestsTableProps) {
  const initialState = { message: '', status: '', requestId: 0 };
  const [state, formAction] = useActionState(handlePTOAction, initialState);
  const router = useRouter();
  React.useEffect(() => {
      if (state?.status === 'error') {
        toast({
          title: 'Error',
          description: (state.message as string) || 'An error occurred',
          variant: 'destructive',
        });
      }else if(state?.status === 'success'){
        toast({
          title: 'Success',
          description: state.message as string,
        });
         router.refresh(); 
        
      }
    }, [state, toast, router]);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(ptoRequests.length / ITEMS_PER_PAGE);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = ptoRequests.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.id}</TableCell>
              <TableCell className="font-medium">
                {request.userName}
              </TableCell>
              <TableCell>
                {request.startDate.toLocaleDateString()}
              </TableCell>
              <TableCell>
                {request.endDate.toLocaleDateString()}
              </TableCell>
              <TableCell>
                <StatusBadge status={request.status} />
              </TableCell>
              <TableCell className="text-right">
                {request.status === 'requested' && (
                  <form
                    action={formAction}
                    className="flex gap-2 justify-end"
                  >
                    <input
                      type="hidden"
                      name="requestId"
                      value={request.id}
                    />
                    <Button size="sm" name="action" value="approved">
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      name="action"
                      value="denied"
                    >
                      Deny
                    </Button>
                  </form>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🔹 PAGINATION CONTROLS */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
