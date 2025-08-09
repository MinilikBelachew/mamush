interface Assignment {
  driverId: string;
  passengerId: string;
  estimatedPickupTime: Date;
  estimatedDropoffTime: Date;
  pickupLocation?: string;
  dropoffLocation?: string;
}

interface ValidationResult {
  errors: string[];
  smartPoolWarnings: string[];
  idleWarnings: string[];
  onTimeCount: number;
  totalAssignments: number;
  efficiencyScore: number;
  utilization: number;
}

export function validateAdvancedAssignments(assignments: Assignment[]): ValidationResult {
  const errors: string[] = [];
  const smartPoolWarnings: string[] = [];
  const idleWarnings: string[] = [];
  const driverMap: Record<string, Assignment[]> = {};

  let totalDrivingTime = 0;
  let totalIdleTime = 0;
  let onTimeCount = 0;

  for (const a of assignments) {
    if (!driverMap[a.driverId]) driverMap[a.driverId] = [];
    driverMap[a.driverId].push({
      ...a,
      estimatedPickupTime: new Date(a.estimatedPickupTime),
      estimatedDropoffTime: new Date(a.estimatedDropoffTime),
    });
  }

  for (const [driverId, rides] of Object.entries(driverMap)) {
    rides.sort((a, b) => a.estimatedPickupTime.getTime() - b.estimatedPickupTime.getTime());

    for (let i = 0; i < rides.length; i++) {
      const ride = rides[i];
      const pickup = ride.estimatedPickupTime;
      const dropoff = ride.estimatedDropoffTime;

      if (dropoff <= pickup) {
        errors.push(`❌ P-${ride.passengerId} (D-${driverId}): Dropoff before pickup`);
      } else {
        onTimeCount++;
      }

      totalDrivingTime += dropoff.getTime() - pickup.getTime();

      if (i > 0) {
        const prevDropoff = rides[i - 1].estimatedDropoffTime;
        const idle = pickup.getTime() - prevDropoff.getTime();
        if (idle > 15 * 60 * 1000) {
          idleWarnings.push(`🕒 D-${driverId}: Idle time between P-${rides[i - 1].passengerId} and P-${ride.passengerId} is ${(idle / 60000).toFixed(1)} mins`);
        }
        if (idle > 0) {
          totalIdleTime += idle;
        }
      }
    }
  }

  // Smart pooling check
  for (let i = 0; i < assignments.length; i++) {
    for (let j = i + 1; j < assignments.length; j++) {
      const a = assignments[i];
      const b = assignments[j];
      if (a.driverId !== b.driverId) continue;

      const pickupGap = Math.abs(new Date(a.estimatedPickupTime).getTime() - new Date(b.estimatedPickupTime).getTime()) / 60000;
      if (pickupGap <= 10) {
        smartPoolWarnings.push(`👥 D-${a.driverId}: Could have carpooled P-${a.passengerId} and P-${b.passengerId} (pickup gap ${pickupGap.toFixed(1)}m)`);
      }
    }
  }

  const totalAssignments = assignments.length;
  const efficiencyScore = Math.max(0, ((onTimeCount - errors.length) / totalAssignments) * 100);
  const utilization = totalDrivingTime + totalIdleTime > 0
    ? (totalDrivingTime / (totalDrivingTime + totalIdleTime)) * 100
    : 100;

  return {
    errors,
    smartPoolWarnings,
    idleWarnings,
    onTimeCount,
    totalAssignments,
    efficiencyScore,
    utilization,
  };
}

export function printAdvancedReport(result: ValidationResult) {
  console.log('\n===== ADVANCED ASSIGNMENT VALIDATION REPORT =====');
  console.log(`Total Assignments: ${result.totalAssignments}`);
  console.log(`✅ On-time Assignments: ${result.onTimeCount}`);
  console.log(`❌ Dropoff Before Pickup: ${result.errors.length}`);
  console.log(`🕒 Large Idle Gaps: ${result.idleWarnings.length}`);
  console.log(`👥 Missed Carpool Opportunities: ${result.smartPoolWarnings.length}`);
  console.log(`📊 Efficiency Score: ${result.efficiencyScore.toFixed(1)} / 100`);
  console.log(`🚗 Driver Utilization: ${result.utilization.toFixed(1)}%`);

  if (result.errors.length) {
    console.log('\nErrors:');
    result.errors.forEach(e => console.log(e));
  }
  if (result.idleWarnings.length) {
    console.log('\nIdle Gaps:');
    result.idleWarnings.forEach(e => console.log(e));
  }
  if (result.smartPoolWarnings.length) {
    console.log('\nCarpool Suggestions:');
    result.smartPoolWarnings.forEach(e => console.log(e));
  }
}

// Usage Example:
// const result = validateAdvancedAssignments(assignmentsFromSchedule);
// printAdvancedReport(result);
