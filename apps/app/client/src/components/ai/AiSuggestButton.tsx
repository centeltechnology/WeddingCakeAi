import React from "react";
import { useCreditsModal } from "./CreditsModalContext";

type Props = {
  label?: string;
  onClick: () => Promise<void>;
  className?: string;
  title?: string;
};

export default function AiSuggestButton({ label = "✨ AI Suggest", onClick, className = "", title }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const creditsModal = useCreditsModal();

  const handle = async () => {
    setErr(null); setLoading(true);
    try { await onClick(); }
    catch (e:any) {
      if (e?.code === 402) {
        creditsModal.open({ reason: "Insufficient credits", needed: e?.payload?.need, have: e?.payload?.have });
      } else {
        setErr(e?.message || "Something went wrong");
      }
    }
    finally { setLoading(false); }
  };

  return (
    <div className={`inline-flex flex-col ${className}`} title={title}>
      <button
        type="button"
        onClick={handle}
        disabled={loading}
        className="px-3 py-2 rounded-xl border text-sm shadow-sm hover:shadow transition disabled:opacity-60"
      >
        {loading ? "Thinking…" : label}
      </button>
      {err && <span className="text-xs text-red-600 mt-1">{err}</span>}
    </div>
  );
}
