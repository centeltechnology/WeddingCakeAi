// In-memory metrics counters for observability
interface Metrics {
  quotes_approved: number;
  contracts_signed: number;
  invoices_paid: number;
}

const metrics: Metrics = {
  quotes_approved: 0,
  contracts_signed: 0,
  invoices_paid: 0,
};

export function incrementMetric(metric: keyof Metrics) {
  if (metric in metrics) {
    metrics[metric]++;
  }
}

export function getMetrics(): Metrics {
  return { ...metrics };
}

export function resetMetrics() {
  metrics.quotes_approved = 0;
  metrics.contracts_signed = 0;
  metrics.invoices_paid = 0;
}
