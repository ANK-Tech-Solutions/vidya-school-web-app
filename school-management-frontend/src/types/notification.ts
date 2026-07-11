export interface Notification { id: number; title: string; message: string; type?: string; read?: boolean; createdAt?: string; }

export interface BroadcastNotificationRequest {
  title: string;
  body: string;
  type: "BUS_STARTED" | "BUS_APPROACHING" | "STUDENT_PICKED" | "STUDENT_DROPPED" | "TRIP_COMPLETED" | "EMERGENCY" | "GENERAL" | "ATTENDANCE" | "SYSTEM";
}

export interface FcmTokenRequest {
  token: string;
}
