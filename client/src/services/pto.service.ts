import api, { apiServer } from "./api";


import { PTORequest } from "../lib/types";


export const createPTO = async (
  pto: Omit<PTORequest, 'id' | 'status' | 'statusChanged'>
): Promise<{ success: boolean; id: number; message: string }> => {
  try {
    const { data } = await apiServer.post<{
      success: boolean;
      id: number;
      message: string;
    }>('/CreatePTO', {
      userId: pto.userId,
      userName: pto.userName,
      startDate: pto.startDate,
      endDate: pto.endDate,
    });

    return data;

  } catch (error: any) {
    console.error('Error creating PTO', error);
    throw error.response?.data ?? error;
  }
};
export const updatePTOStatus = async (
  id: number,
  status: 'approved' | 'denied'
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await apiServer.put<{ success: boolean; message: string }>('/UpdatePTOStatus', {
      id,
      status,
    });

    return data;

  } catch (error: any) {
    console.error('Error updating PTO status', error);
    throw error.response?.data ?? error;
  }
};
export const getAllPTO = async (): Promise<PTORequest[]> => {
  try {
    const { data } = await apiServer.get<PTORequest[]>('/GetAllPTO');

    return data.map((pto) => ({
      ...pto,
      startDate: new Date(pto.startDate),
      endDate: new Date(pto.endDate),
      createdAt: pto.createdAt ? new Date(pto.createdAt) : new Date(),
    }));

  } catch (error) {
    console.error('Error fetching PTO requests', error);
    throw error;
  }
};

