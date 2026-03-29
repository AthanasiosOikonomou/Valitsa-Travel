import { showTrips } from "@/lib/showTrips";

let tripsRoutePromise: Promise<unknown> | null = null;

export const prefetchTripsRoute = () => {
  if (!showTrips) return;

  if (!tripsRoutePromise) {
    tripsRoutePromise = import("@/pages/Trips.tsx");
  }

  return tripsRoutePromise;
};
