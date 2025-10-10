import { useQuery } from '@tanstack/react-query';

export default function ContractTimeline({ contractId }: { contractId: string }) {
  const { data } = useQuery({
    queryKey: ['contract-events', contractId],
    queryFn: async () => (await fetch(`/api/contracts/${contractId}/events`)).json()
  });
  
  const list = Array.isArray(data) ? data : [];
  
  return (
    <div className="space-y-3">
      {list.map((e: any) => (
        <div key={e.id} className="rounded-xl border p-3">
          <div className="text-sm opacity-70">{new Date(e.createdAt).toLocaleString()}</div>
          <div className="font-medium">{e.type}</div>
          {e.meta && <pre className="text-xs opacity-80 overflow-auto">{JSON.stringify(e.meta, null, 2)}</pre>}
        </div>
      ))}
    </div>
  );
}
