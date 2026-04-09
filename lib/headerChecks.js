export function checkHeaders(headers) {
  const findings = [];
  const status = {
    "x-frame-options": "missing",
    "content-security-policy": "missing",
    "strict-transport-security": "missing",
    "x-content-type-options": "missing",
    "referrer-policy": "missing",
    "permissions-policy": "missing"
  };

  // a) X-Frame-Options
  if (headers['x-frame-options']) {
    status["x-frame-options"] = "present";
  } else {
    findings.push({
      id: "missing-xfo",
      title: "Missing X-Frame-Options",
      severity: "high",
      description: "Protects against clickjacking by preventing the site from being embedded in an iframe.",
      header: "X-Frame-Options"
    });
  }

  // b) Content-Security-Policy
  if (headers['content-security-policy']) {
    status["content-security-policy"] = "present";
  } else {
    findings.push({
      id: "missing-csp",
      title: "Missing Content-Security-Policy",
      severity: "high",
      description: "Reduces XSS and data injection risk by defining trusted sources of content.",
      header: "Content-Security-Policy"
    });
  }

  // c) Strict-Transport-Security (HSTS)
  const hsts = headers['strict-transport-security'];
  if (hsts) {
    status["strict-transport-security"] = "present";
    const maxAgeMatch = hsts.match(/max-age=(\d+)/);
    if (maxAgeMatch && parseInt(maxAgeMatch[1]) < 31536000) {
      findings.push({
        id: "weak-hsts",
        title: "Weak HSTS duration",
        severity: "low",
        description: "HSTS max-age should be at least 1 year (31,536,000 seconds).",
        header: "Strict-Transport-Security"
      });
    }
  } else {
    findings.push({
      id: "missing-hsts",
      title: "Missing Strict-Transport-Security",
      severity: "medium",
      description: "Forces browsers to exclusively use HTTPS for all communication.",
      header: "Strict-Transport-Security"
    });
  }

  // d) X-Content-Type-Options
  if (headers['x-content-type-options'] === "nosniff") {
    status["x-content-type-options"] = "present";
  } else {
    findings.push({
      id: "missing-xcto",
      title: "Missing X-Content-Type-Options",
      severity: "low",
      description: "Prevents browsers from MIME-sniffing away from the declared content-type.",
      header: "X-Content-Type-Options"
    });
  }

  // e) Referrer-Policy
  if (headers['referrer-policy']) {
    status["referrer-policy"] = "present";
  } else {
    findings.push({
      id: "missing-rp",
      title: "Missing Referrer-Policy",
      severity: "low",
      description: "Controls how much referrer information is passed to other sites.",
      header: "Referrer-Policy"
    });
  }

  // f) Permissions-Policy
  if (headers['permissions-policy']) {
    status["permissions-policy"] = "present";
  } else {
    findings.push({
      id: "missing-pp",
      title: "Missing Permissions-Policy",
      severity: "low",
      description: "Restricts access to browser features (camera, geolocation, etc.).",
      header: "Permissions-Policy"
    });
  }

  return { findings, status };
}
