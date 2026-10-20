import type { CycleNumber } from "@/lib/calculations";

export type UserRole = "admin" | "owner";

export type SessionUser = {
  id: string;
  role: UserRole;
};

export type Village = {
  id: string;
  ownerId: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  ownerId: string;
  villageId: string;
  customerNumber: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Shift = "AM" | "PM";

export type DailyEntry = {
  id: string;
  ownerId: string;
  villageId: string;
  customerId: string;
  customerNumber: number;
  customerName: string;
  entryDate: string;
  shift: Shift;
  weight: number;
  fat: number;
  createdAt: string;
  updatedAt: string;
};

export type CycleParameterRecord = {
  id: string;
  ownerId: string;
  customerId: string;
  cycle: CycleNumber;
  fixedFat: number;
  rate: number;
  fixedNumber: number;
  createdAt: string;
  updatedAt: string;
};

export type CustomerSort = "modified" | "alpha";

export type AppUserListItem = {
  id: string;
  role: UserRole;
  createdAt: string;
};
