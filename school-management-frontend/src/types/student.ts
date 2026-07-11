export interface Student { id: number; studentCode: string; firstName: string; lastName: string; grade: string; section: string; gender?: string; parentId?: number; parentName?: string; pickupAddress?: string; active: boolean; }
export type StudentPayload = Omit<Student, "id" | "parentName" | "active"> & { active?: boolean };
