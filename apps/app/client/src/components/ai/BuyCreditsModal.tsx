import React from "react";

export default function BuyCreditsModal({ onClose, meta }:{ onClose: () => void; meta?: { reason?: string; needed?: number; have?: number } }) {
  const [pack, setPack] = React.useState<"200"|"500"|"1000">("200");

  return (
    <div>
      <div className="text-lg font-semibold">Get more AI credits</div>
      <div className="text-sm text-gray-600 mt-1">
        {meta?.reason ? <>Reason: <span className="font-medium">{meta.reason}</span></> : "Add credits to keep using AI tools."}
      </div>
      <div className="mt-3 p-2 text-xs bg-gray-50 rounded border">
        {typeof meta?.have === "number" && typeof meta?.needed === "number" ? (
          <>You have <b>{meta.have}</b>, need <b>{meta.needed}</b>.</>
        ) : <>Choose a top-up pack below.</>}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={()=>setPack("200")} className={`border rounded p-2 ${pack==="200"?"bg-white shadow":""}`}>
          <div className="font-medium">200</div>
          <div className="text-xs text-gray-600">$9</div>
        </button>
        <button onClick={()=>setPack("500")} className={`border rounded p-2 ${pack==="500"?"bg-white shadow":""}`}>
          <div className="font-medium">500</div>
          <div className="text-xs text-gray-600">$19</div>
        </button>
        <button onClick={()=>setPack("1000")} className={`border rounded p-2 ${pack==="1000"?"bg-white shadow":""}`}>
          <div className="font-medium">1000</div>
          <div className="text-xs text-gray-600">$35</div>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="px-3 py-2 text-sm border rounded" onClick={onClose}>Close</button>
        <button
          className="px-3 py-2 text-sm border rounded bg-black text-white"
          onClick={async () => {
            try {
              const res = await fetch("/api/billing/topup", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pack })
              });
              if (!res.ok) {
                const txt = await res.text().catch(()=> "");
                throw new Error(`Top-up failed: ${res.status} ${res.statusText} - ${txt}`);
              }
              // notify the app that credits changed
              window.dispatchEvent(new CustomEvent("ai-credits:updated"));
              onClose();
            } catch (e:any) {
              alert(e?.message || "Top-up failed");
            }
          }}
        >
          Buy Pack
        </button>
      </div>
    </div>
  );
}
