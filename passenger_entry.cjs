// CommonJS entry for Phusion Passenger (require() cannot load ESM). Loads the ESM API via dynamic import().
import("./server/index.js").catch((err) => {
  console.error("[passenger_entry]", err);
  process.exit(1);
});
