export type Role = "Admin" | "Dispatcher" | "Driver";

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  roles: Role[];
  expiresAt: string;
}

export interface Driver {
  id: number;
  fullName: string;
  licenseNumber: string;
}

export interface Vehicle {
  id: number;
  vehicleNumber: string;
  licensePlate: string | null;
}

export type DutyStatus = "OffDuty" | "SleeperBerth" | "Driving" | "OnDutyNotDriving";

export interface LogEntry {
  id: number;
  status: DutyStatus;
  startTime: string;
  endTime: string;
  isAuto: boolean;
}

export interface Trip {
  id: number;
  driverId: number;
  driverName: string;
  vehicleId: number;
  vehicleNumber: string;
  shipperName: string;
  loadNumber: string;
  distanceMiles: number;
  averageSpeedMph: number;
  startTime: string;
  endTime: string | null;
  originLat?: number | null;
  originLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
  hasViolations: boolean;
}

export type FlagSeverity = "Info" | "Warning" | "Violation";

export interface ComplianceFlag {
  id: number;
  ruleCode: string;
  description: string;
  severity: FlagSeverity;
  detectedAt: string;
}

export interface DashboardSummary {
  activeTrips: number;
  flaggedTrips: number;
  driversOnDuty: number | null;
  totalUsers: number | null;
  totalDrivers: number | null;
  totalVehicles: number | null;
  violationsLast30Days: number | null;
}

export interface CreateTripPayload {
  driverId: number;
  vehicleId: number;
  shipperName: string;
  loadNumber: string;
  distanceMiles: number;
  averageSpeedMph: number;
  startTime: string;
  originLat?: number | null;
  originLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
}

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  roles: Role[];
}