import { useQuery } from '@tanstack/react-query';

export default function ContractTimeline({ contractId }: { contractId: string }) {
  const { data } = useQuery({
    queryKey: ['contract-events', contractId],
    queryFn: async () => (await fetch(`/api/contracts/${contractId}/events`)).json()
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
