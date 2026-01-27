'use server';

import type { PTORequest, User } from '@/lib/types';
import { z } from 'zod';
import employeeStore,{ptoRequests} from '@/lib/mock-data';
import { clockEmployee, findByID, validateUser } from '@/services/user.service';
import { Console } from 'console';
import { revalidatePath } from 'next/cache';
import { createPTO, updatePTOStatus } from '@/services/pto.service';

export type ClockState = {
  status: 'success' | 'error' | 'idle';
  message: string;
  user?: User;
  actionType?: 'in' | 'out';
  timestamp?: string;
}

const schema = z.object({
  userId: z.string().min(1, { message: 'User ID is required.' }),
  pin: z.string().min(1, { message: 'PIN is required.' }),
  actionType: z.enum(['in', 'out']),
  imageBase64: z.string().optional(),
});

export async function handleClockAction(prevState: ClockState, formData: FormData): Promise<ClockState> {
  // Artificial delay to simulate network latency
  console.log("Handling clock action with formData:", formData);
  await new Promise(res => setTimeout(res, 1000));
  const validatedFields = schema.safeParse({
    userId: formData.get('userId'),
    pin: formData.get('pin'),
    actionType: formData.get('actionType'),
    imageBase64 : formData.get("image") as string
  });
  console.log("Validated Fields:", validatedFields);
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.flatten().fieldErrors.userId?.[0] || validatedFields.error.flatten().fieldErrors.pin?.[0] || 'Invalid input.',
    };
  }
  let user: User | undefined = undefined;
  const { userId, pin, actionType, imageBase64 } = validatedFields.data;
    try {
    const response = await validateUser(Number(userId), pin);

    if (response.success) {
      user = response.user;
    } else {
      console.warn(response.message);
    }
  } catch (error) {
    console.error("Error validating user:", error);
    return {
      status: 'error',
      message: 'Invalid User ID or PIN.',
    };
  }
  if (!user) {
    return {
      status: 'error',
      message: 'Invalid User ID or PIN.',
    };
  }

  var response =  undefined;
  console.log("IMAGE BASE 64:", imageBase64);
  try {
    response = await clockEmployee({
    UserID: Number(userId),
    image:  imageBase64,
    debugInfo: {
      source: "server-action"
    }
  });
  }catch (error) {
   
    return {
      status: 'error',
      message: 'Failed to clock action. Please try again.'+error,
    };
  }
  
  if (!response.success) {
    return {
      status: 'error',
      message: response.message || 'Failed to clock action.',
    };
  }
  const action = response.action?.replace('Clock ', '').toLowerCase() as 'in' | 'out' || actionType;
  return {
    status: 'success',
    message: `Successfully clocked ${action}.`,
    user,
    actionType: action,
    timestamp: response.timestamp,
  };
}
const ptoSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  dateRange: z.string().min(1, { message: "Date range is required." }),
});
export async function handlePTORequest(prevState: any, formData: FormData) {
    const validatedFields = ptoSchema.safeParse({
        userId: formData.get('userId'),
        dateRange: formData.get('dateRange'),
    });

    if (!validatedFields.success) {
        return { status: 'error', message: 'Invalid input.' };
    }

    const { userId, dateRange } = validatedFields.data;
    const [startDateStr, endDateStr] = dateRange.split(' to ');

    const user = await findByID(userId);
    if (!user) {
        return { status: 'error', message: 'User ID not found.' };
    }
    console.log("Found user for PTO request:", user);
    console.log("Creating PTO request for user:", user.Name);
    const newRequest: PTORequest = {
        userId,
        userName: user.Name,
        startDate: new Date(startDateStr),
        endDate: endDateStr ? new Date(endDateStr) : new Date(startDateStr),
        status: 'requested',
        statusChanged: false,
    };
    console.log("New PTO Request:", newRequest);
    try{
      const res = await createPTO(newRequest);
      if (!res.success) {
        return { status: 'error', message: res.message || 'Failed to create PTO request.' };
    }

    return { status: 'success', message: 'Your PTO request has been submitted.' };
    }catch(error){
        if(error && typeof error === 'object' && 'message' in error){
            return { status: 'error', message: error.message || 'Failed to create PTO request.'};
        }
        return { status: 'error', message: 'Failed to create PTO request.'};
    }
    
    
}
const ptoActionSchema = z.object({
  requestId: z.string(),
  action: z.enum(['approved', 'denied']),
});

export async function handlePTOAction(prevState: any, formData: FormData) {
  const validatedFields = ptoActionSchema.safeParse({
    requestId: formData.get('requestId'),
    action: formData.get('action'),
  });

  if (!validatedFields.success) {
    console.error("Invalid PTO action:", validatedFields.error.flatten());
    return;
  }
  
  const { requestId, action } = validatedFields.data;
  try{
    const res=await updatePTOStatus(Number(requestId), action);
    if (res.success) {
      return { status: 'success', message: 'PTO request updated successfully.',requestId: Number(requestId)};
      
    }
  }catch(error){
    if(error && typeof error === 'object' && 'message' in error){
            return { status: 'error', message: error.message || 'Failed to update PTO status.'};
        }
        return { status: 'error', message: 'Failed to update PTO status.',requestId: Number(requestId)};
  }
}