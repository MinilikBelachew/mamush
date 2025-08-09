type LatLng = { lat: number; lng: number };

// Haversine Distance (meters)
export function getDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth radius (km)
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const aH = Math.sin(dLat / 2) ** 2 +
             Math.cos(lat1) * Math.cos(lat2) *
             Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aH), Math.sqrt(1 - aH));
  return R * c;
}

export function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Bearing (degrees)
export function getBearing(from: LatLng, to: LatLng): number {
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLon = toRad(to.lng - from.lng);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export function areDirectionsAligned(
  a1: LatLng,
  a2: LatLng,
  b1: LatLng,
  b2: LatLng,
  maxAngleDiff = 30
): boolean {
  const dir1 = getBearing(a1, a2);
  const dir2 = getBearing(b1, b2);
  const diff = Math.abs(dir1 - dir2);
  return diff <= maxAngleDiff || diff >= 360 - maxAngleDiff;
}

export function hungarianAlgorithm(costMatrix: number[][]): [number, number][] {
  const n = costMatrix.length; // Number of rows (workers/drivers)
  const m = costMatrix[0].length; // Number of columns (jobs/passengers)
  const size = Math.max(n, m); // Max dimension for square matrix

  // 1. Pad to square matrix with a large cost for non-existent cells
  const matrix: number[][] = Array.from({ length: size }, (_, i) =>
    Array.from(
      { length: size },
      (_, j) => (i < n && j < m ? costMatrix[i][j] : 9999999) // Use a larger "infinity" to be safe
    )
  );

  // Initial labels (dual variables)
  // labelByWorker[i] = u_i (for rows)
  // labelByJob[j] = v_j (for columns)
  const labelByWorker = new Array(size).fill(0);
  const labelByJob = new Array(size).fill(0);

  // Initial matches
  // matchJobByWorker[i] = j means worker i is matched to job j
  // matchWorkerByJob[j] = i means job j is matched to worker i
  const matchJobByWorker = new Array(size).fill(-1);
  const matchWorkerByJob = new Array(size).fill(-1);

  // Initialize labels
  // For each worker (row), find the minimum cost in that row
  for (let i = 0; i < size; i++) {
    labelByWorker[i] = Math.min(...matrix[i]);
  }
  // No initial labelByJob setup needed like this, as it's adjusted later
  // based on "slacks" in the alternating tree construction.

  // Main loop: Iterate for each worker to try and find an assignment
  for (let w = 0; w < size; w++) {
    let pathFound = false;
    // const parent = new Array(size).fill(-1); // To reconstruct augmenting path
    const seenWorkers = new Array(size).fill(false); // Workers in the current alternating tree
    const seenJobs = new Array(size).fill(false); // Jobs in the current alternating tree

    const slack = new Array(size).fill(Infinity); // Stores minimum slack for each unseen job
    const slackWorker = new Array(size).fill(-1); // Stores the worker that produced the min slack for a job

    // Initialize for the current worker 'w'
    // All jobs are initially unseen.
    // Slack for job 'j' is matrix[w][j] - labelByWorker[w] - labelByJob[j]
    for (let j = 0; j < size; j++) {
      slack[j] = matrix[w][j] - labelByWorker[w] - labelByJob[j];
      slackWorker[j] = w;
    }

    // Loop to find an augmenting path or adjust labels
    while (!pathFound) {
      // Find the job 'j' with the minimum slack among unseen jobs
      let minSlack = Infinity;
      let minSlackJob = -1;
      for (let j = 0; j < size; j++) {
        if (!seenJobs[j] && slack[j] < minSlack) {
          minSlack = slack[j];
          minSlackJob = j;
        }
      }

      // If minSlack is greater than 0, we need to adjust labels
      if (minSlack > 0) {
        // Adjust labels for workers in the tree (seenWorkers) and jobs in the tree (seenJobs)
        for (let i = 0; i < size; i++) {
          if (seenWorkers[i]) {
            labelByWorker[i] += minSlack;
          }
          if (seenJobs[i]) {
            labelByJob[i] -= minSlack;
          }
        }
        // Update slacks for unseen jobs
        for (let j = 0; j < size; j++) {
          if (!seenJobs[j]) {
            slack[j] -= minSlack;
          }
        }
      }

      // Now, minSlackJob should point to a job with 0 slack (after adjustment if needed)
      // Add minSlackJob to the seenJobs set
      seenJobs[minSlackJob] = true;

      // If minSlackJob is unmatched, we found an augmenting path
      if (matchWorkerByJob[minSlackJob] === -1) {
        pathFound = true;
        // Reconstruct and augment path
        let currentJob = minSlackJob;
        while (currentJob !== -1) {
          const currentWorker = slackWorker[currentJob];
          const nextJob = matchJobByWorker[currentWorker];
          matchJobByWorker[currentWorker] = currentJob;
          matchWorkerByJob[currentJob] = currentWorker;
          currentJob = nextJob;
        }
      } else {
        // If minSlackJob is matched, extend the alternating path
        const matchedWorker = matchWorkerByJob[minSlackJob];
        seenWorkers[matchedWorker] = true; // Add matched worker to seen set

        // Update slacks for jobs connected to this newly seen worker
        for (let j = 0; j < size; j++) {
          if (!seenJobs[j]) {
            const newSlack =
              matrix[matchedWorker][j] -
              labelByWorker[matchedWorker] -
              labelByJob[j];
            if (newSlack < slack[j]) {
              slack[j] = newSlack;
              slackWorker[j] = matchedWorker;
            }
          }
        }
      }
    }
  }

  // Filter results to only include valid assignments (original n and m dimensions)
  // and exclude padded matches (-1 for job or a job index >= m)
  return matchJobByWorker
    .map((job, worker) => [worker, job] as [number, number])
    .filter(([worker, job]) => worker < n && job < m && job !== -1);
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of Earth in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
