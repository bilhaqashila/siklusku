export function reportWebVitals(metric) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  const tracked = ["CLS", "LCP", "INP"];
  if (!tracked.includes(metric?.name)) {
    return;
  }
  console.info(`[web-vitals] ${metric.name}: ${metric.value.toFixed(2)}`);
}
