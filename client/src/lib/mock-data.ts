import type { User, TimeEntry, PTORequest } from './types';
import { PlaceHolderImages } from './placeholder-images';

let employees: User[] = [];
let employeeId=-1;
export const employeeStore = {
  // Cambiamos a "setEmployees" o permitimos que acepte un array
  addEmployees(data: User | User[]) {
    if (Array.isArray(data)) {
      employees = [...employees, ...data];
    } else {
      employees.push(data);
    }
  },
  getEmployees() {
    return [...employees]; // Devolvemos una copia para evitar mutaciones externas
  },
  clear() {
    employees = [];
  },
  getEmployeeId() {
  return employeeId;
},
setEmployeeId (id: number) {
  employeeId = id;
}
};

export default employeeStore;

/* export const timeEntries: TimeEntry[] = [
  { id: 't1', userId: '1234', userName: 'Alice Johnson', clockIn: new Date('2024-07-26T09:01:00'), clockOut: new Date('2024-07-26T17:05:00') },
  { id: 't2', userId: '5678', userName: 'Bob Williams', clockIn: new Date('2024-07-26T08:55:00'), clockOut: new Date('2024-07-26T17:15:00') },
  { id: 't3', userId: '9012', userName: 'Charlie Brown', clockIn: new Date('2024-07-26T09:10:00'), clockOut: new Date('2024-07-26T16:50:00') },
  { id: 't4', userId: '1234', userName: 'Alice Johnson', clockIn: new Date('2024-07-25T09:03:00'), clockOut: new Date('2024-07-25T17:00:00') },
  { id: 't5', userId: '5678', userName: 'Bob Williams', clockIn: new Date('2024-07-25T08:58:00'), clockOut: new Date('2024-07-25T17:02:00') },
  { id: 't6', userId: '9012', userName: 'Charlie Brown', clockIn: new Date() },
]; */
export const ptoRequests: PTORequest[] = [
    { id: 'pto1', userId: '1234', userName: 'Alice Johnson', startDate: new Date('2024-08-15'), endDate: new Date('2024-08-16'), status: 'approved', statusChanged: true },
    { id: 'pto2', userId: '5678', userName: 'Bob Williams', startDate: new Date('2024-09-02'), endDate: new Date('2024-09-02'), status: 'requested', statusChanged: false },
    { id: 'pto3', userId: '1234', userName: 'Alice Johnson', startDate: new Date('2024-08-20'), endDate: new Date('2024-08-20'), status: 'denied', statusChanged: true },
    { id: 'pto4', userId: '9012', userName: 'Charlie Brown', startDate: new Date('2024-08-22'), endDate: new Date('2024-08-23'), status: 'requested', statusChanged: false },
];
