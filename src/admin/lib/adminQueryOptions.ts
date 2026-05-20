export function adminBackgroundRefetchOptions(isDirty: boolean) {
  return {
    refetchOnWindowFocus: !isDirty,
    refetchOnReconnect: !isDirty,
  } as const;
}
