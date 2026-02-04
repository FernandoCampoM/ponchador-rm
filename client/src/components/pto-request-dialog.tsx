'use client';

import { useActionState, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CalendarPlus } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handlePTORequest } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

export function PTORequestDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>();
  const { toast } = useToast();

  const initialState = { message: '', status: '' };
  const [state, formAction] = useActionState(handlePTORequest, initialState);

  React.useEffect(() => {
    if (state.status === 'success') {
      toast({
        title: 'Success',
        description: (state.message as string) || 'Request submitted successfully',
      });
      setIsOpen(false);
      setDate(undefined);
    } else if (state.status === 'error') {
      toast({
        title: 'Error',
        description: (state.message as string) || 'An error occurred',
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button  className="w-full text-lg py-6 mt-2" variant="corporate">
          <CalendarPlus className="mr-2 h-5 w-5" />
          PTO
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Request Paid Time Off</DialogTitle>
            <DialogDescription>
              Enter your User ID and select the date(s) you would like to request off.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userId" className="text-right">
                User ID
              </Label>
              <Input
                id="userId"
                name="userId"
                className="col-span-3"
                placeholder="Enter your User ID"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date(s)</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'LLL dd, y')} -{' '}
                            {format(date.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(date.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date or range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
                <input type="hidden" name="dateRange" value={date ? `${date.from?.toISOString()} to ${date.to?.toISOString()}`: ''} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
