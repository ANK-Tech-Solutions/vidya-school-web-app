export interface Parent { id: number; userId?: number; username: string; email: string; firstName: string; lastName: string; phone?: string; relationship?: string; active: boolean; }
export type ParentPayload = Omit<Parent, "id" | "userId" | "active"> & { password?: string; active?: boolean };
