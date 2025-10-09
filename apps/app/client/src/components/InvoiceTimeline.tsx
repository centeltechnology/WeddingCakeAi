import { useQuery } from '@tanstack/react-query';

export default function InvoiceTimeline({ invoiceId }: { invoiceId: string }) {
  const { data } = useQuery({
    queryKey: ['invoice-events', invoiceId],
    queryFn: async () => (await fetch(`/api/invoices/${invoiceId}/events`)).json()
  });
  if (!data) return null;
  return (
    <div className="space-y-3">
      {data.map((e: any) => (
        <div key={e.id} className="rounded-xl border p-3">
          <div className="text-sm opacity-70">{new Date(e.createdAt).toLocaleString()}</div>
          <div className="font-medium capitalize">{e.type.replace('_',' ')}</div>
          {e.meta?.note && <div className="text-sm">{e.meta.note}</div>}
        </div>
      ))}
    </div>
  );
}
