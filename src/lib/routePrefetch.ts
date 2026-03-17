let tripsRoutePromise: Promise<unknown> | null = null;

export const prefetchTripsRoute = () => {
  if (!tripsRoutePromise) {
    tripsRoutePromise = import("@/pages/Trips.tsx");
  }

  return tripsRoutePromise;
};
