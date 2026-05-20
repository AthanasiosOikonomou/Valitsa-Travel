/** Module-level dirty editor count (usable from adminApi without React). */
let adminEditingDirtyCount = 0;

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function getAdminEditingDirtyCount(): number {
  return adminEditingDirtyCount;
}

export function subscribeAdminEditingDirty(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function registerAdminEditingDirty(): () => void {
  adminEditingDirtyCount += 1;
  notifyListeners();
  return () => {
    adminEditingDirtyCount = Math.max(0, adminEditingDirtyCount - 1);
    notifyListeners();
  };
}
