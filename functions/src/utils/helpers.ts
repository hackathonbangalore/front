import { THRESHOLD_LIMITS } from "./constants.js";

export function calculateDensityLevel(person_count: number): string {
  if (person_count < 20) return "low";
  if (person_count < 40) return "medium";
  if (person_count < 60) return "high";
  return "critical";
}

export function getPriorityByAnomalyType(anomaly_type: string): number {
  const highPriorityTypes = ["fire", "stampede", "weapon"];
  return highPriorityTypes.includes(anomaly_type.toLowerCase()) ? 2 : 1;
}

export function generateAnomalyMessage(
  anomaly_type: string,
  location: string
): string {
  const messages: { [key: string]: string } = {
    fire: `Fire detected in ${location}`,
    smoking: `Person smoking detected in ${location}`,
    abandoned_bag: `Abandoned bag detected in ${location}`,
    stampede: `Crowd stampede detected in ${location}`,
    weapon: `Weapon detected in ${location}`,
  };

  return (
    messages[anomaly_type.toLowerCase()] ||
    `${anomaly_type} detected in ${location}`
  );
}

export function isThresholdExceeded(
  person_count: number,
  type: "warning" | "critical" = "warning"
): boolean {
  return (
    person_count >=
    THRESHOLD_LIMITS.OCCUPANCY[
      type.toUpperCase() as keyof typeof THRESHOLD_LIMITS.OCCUPANCY
    ]
  );
}
