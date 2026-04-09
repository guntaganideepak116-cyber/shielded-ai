export function calculateScore(vulnerabilities, ssl, virusTotal) {
  let score = 100;

  // Deduct based on vulnerabilities (severity)
  // Note: SSL and VirusTotal issues are integrated into vulnerabilities list in api/scan.js
  // So we only need to deduct based on findings severity to avoid double penalties.
  vulnerabilities.forEach(v => {
    if (v.severity === "critical") score -= 30; // Deduct more for critical if defined
    else if (v.severity === "high") score -= 15; // Moderate deduction
    else if (v.severity === "medium") score -= 8;
    else if (v.severity === "low") score -= 3;
  });

  // Minimum score: 0
  if (score < 0) score = 0;

  return score;
}

export function getStatus(score) {
  if (score >= 80) return "secure";
  return "vulnerable"; 
}
