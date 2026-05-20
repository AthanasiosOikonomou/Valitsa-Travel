import { createContext, useContext, useEffect, type ReactNode } from "react";
import {
  getAdminEditingDirtyCount,
  registerAdminEditingDirty,
} from "@/admin/lib/adminEditingRegistry";

const AdminEditingContext = createContext(true);

export function AdminEditingProvider({ children }: { children: ReactNode }) {
  return (
    <AdminEditingContext.Provider value={true}>
      {children}
    </AdminEditingContext.Provider>
  );
}

/** Register while `isDirty` is true (ref-counted for nested editors). */
export function useRegisterAdminEditingDirty(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) return;
    return registerAdminEditingDirty();
  }, [isDirty]);
}

export function useAdminEditingDirtyCount(): number {
  useContext(AdminEditingContext);
  return getAdminEditingDirtyCount();
}

export { getAdminEditingDirtyCount };
