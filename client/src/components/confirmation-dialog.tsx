"use client";

import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { ClockState } from '@/app/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { urlServer } from '@/services/api';
function getEvidenceUrl(userId: string, timestamp: Date): string {
  const yyyy = timestamp.getFullYear();
  const mm = String(timestamp.getMonth() + 1).padStart(2, '0');
  const dd = String(timestamp.getDate()).padStart(2, '0');
  const hh = String(timestamp.getHours()).padStart(2, '0');
  const min = String(timestamp.getMinutes()).padStart(2, '0');
  const ss = String(timestamp.getSeconds()).padStart(2, '0');

  const timeStr = `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
  const filename = `${userId}_${timeStr}.jpg`;
  console.log("Generated URL:", `${urlServer}/files/${filename}`);

  return `${urlServer}/files/${filename}`;
}
interface ConfirmationDialogProps {
  state: ClockState;
  onClose: () => void;
}

export function ConfirmationDialog({ state, onClose }: ConfirmationDialogProps) {
  const isOpen = state.status === 'success' && !!state.user;
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
        <div className="flex flex-col items-center justify-center">
          <img
            src={getEvidenceUrl(state.user?.ID as string, new Date((state.timestamp as unknown as string).replace('T', ' ').replace('Z', ''))) || userAvatar?.imageUrl || ''}
            alt={state.user?.Name || 'User Avatar'}
            width={150}
            height={150}
            className="rounded-full border-4 border-primary shadow-lg"
            data-ai-hint={userAvatar?.imageHint}
          />
          <AlertDialogTitle className="mt-4 text-2xl text-center">{state.user?.Name}</AlertDialogTitle>
        </div>
        <div className="flex flex-col justify-center">
          <AlertDialogHeader>
            <AlertDialogDescription className="text-center md:text-left text-lg">
              You have successfully
            </AlertDialogDescription>
            <div className="text-4xl font-bold text-primary text-center md:text-left">
              Clocked {state.actionType === 'in' ? 'In' : 'Out'}
            </div>
          </AlertDialogHeader>
          <div className="mt-4 text-center md:text-left">
            <p className="text-muted-foreground">at</p>
            <p className="text-xl font-medium">
              {state.timestamp ? new Date((state.timestamp as unknown as string).replace('T', ' ').replace('Z', '')).toLocaleTimeString() : ''}
            </p>
          </div>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction onClick={onClose} className="w-full">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
