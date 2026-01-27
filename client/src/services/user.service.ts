import api, { apiServer } from "./api";

import { ClockResponse,ClockRequest, User, ValidateUserResponse } from "../lib/types";

/**
 * Fetches all employees from the API.
 *
 * @returns A promise that resolves to an array of employees.
 * @throws An error if there is an issue fetching the employees.
 */

export const getAllEmployees = async (): Promise<User[]> => {
  try {
    const { data } = await apiServer.get<User[]>("/GetEmployees");
    return data;
  } catch (error) {
    console.error("Error fetching employees", error);
    throw error; // importante para que el componente lo maneje
  }
};
export const findByID = async (id: string): Promise<User | null> => {
  try {
    const { data } = await apiServer.get<User>(`/GetEmployees?ID=${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching employee by ID", error);
    throw error; // importante para que el componente lo maneje
  }
};
export const validateUser = async (
  userId: number,
  userPass: string
): Promise<ValidateUserResponse> => {
  try {
    const { data } = await apiServer.get<ValidateUserResponse>(
      `/ValidateUser?UserID=${userId}&UserPass=${userPass}`
    );

    return data;
  } catch (error) {
    console.error("Error validating user", error);
    throw error; // importante para que el componente lo maneje
  }
};
export const clockEmployee = async (
  payload: ClockRequest
): Promise<ClockResponse> => {
  try {
    const { data } = await apiServer.post<ClockResponse>(
      "/clock",
      payload
    );
    
    return data;
  } catch (error) {
    console.error("Error clocking employee", error);
    throw error;
  }
};