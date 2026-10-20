import type { CycleNumber } from "@/lib/calculations";
import type {
  AppUserListItem,
  Customer,
  CycleParameterRecord,
  DailyEntry,
  Shift,
  UserRole,
  Village,
} from "@/lib/types";

export type VillageRow = {
  id: string;
  owner_id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
};

export type CustomerRow = {
  id: string;
  owner_id: string;
  village_id: string;
  customer_number: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type DailyEntryRow = {
  id: string;
  owner_id: string;
  village_id: string;
  customer_id: string;
  customer_number: number;
  customer_name: string;
  entry_date: string;
  shift: Shift;
  weight: number | string;
  fat: number | string;
  created_at: string;
  updated_at: string;
};

export type CycleParameterRow = {
  id: string;
  owner_id: string;
  customer_id: string;
  cycle: number;
  fixed_fat: number | string;
  rate: number | string;
  fixed_number: number | string;
  created_at: string;
  updated_at: string;
};

export function mapVillage(row: VillageRow): Village {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    code: row.code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    ownerId: row.owner_id,
    villageId: row.village_id,
    customerNumber: row.customer_number,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDailyEntry(row: DailyEntryRow): DailyEntry {
  return {
    id: row.id,
    ownerId: row.owner_id,
    villageId: row.village_id,
    customerId: row.customer_id,
    customerNumber: row.customer_number,
    customerName: row.customer_name,
    entryDate: row.entry_date,
    shift: row.shift,
    weight: Number(row.weight),
    fat: Number(row.fat),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCycleParameter(row: CycleParameterRow): CycleParameterRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    customerId: row.customer_id,
    cycle: row.cycle as CycleNumber,
    fixedFat: Number(row.fixed_fat),
    rate: Number(row.rate),
    fixedNumber: Number(row.fixed_number),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAppUser(row: {
  id: string;
  role: UserRole;
  created_at: string;
}): AppUserListItem {
  return {
    id: row.id,
    role: row.role,
    createdAt: row.created_at,
  };
}
