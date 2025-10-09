import React from "react";
import AiSuggestButton from "./AiSuggestButton";
import { aiQuotesSuggestPrice } from "../../api/ai";

type Props = {
  defaultGuestCount?: number;
  onApplyTotal?: (total: number) => void;
};

export default function QuoteAiAssist({ defaultGuestCount = 50, onApplyTotal }: Props) {
  const [guestCount, setGuestCount] = React.useState(defaultGuestCount);
  const [icing, setIcing] = React.useState<"buttercream"|"fondant">("buttercream");
  const [complexity, setComplexity] = React.useState<"basic"|"standard"|"premium"|"couture">("standard");
  const [deliveryMiles, setDeliveryMiles] = React.useState(0);
  const [output, setOutput] = React.useState<any>(null);

  const run = async () => {
    const res = await aiQuotesSuggestPrice({ guestCount, icing, complexity, deliveryMiles });
    setOutput(res);
  };

  return (
    <div className="p-3 border rounded-xl bg-white/60 backdrop-blur-sm">
      <div className="text-sm font-medium mb-2">✨ AI Price Suggestion</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input className="border rounded px-2 py-1" type="number" min={5} value={guestCount} onChange={e=>setGuestCount(parseInt(e.target.value||"0",10))} placeholder="Guests" />
        <select className="border rounded px-2 py-1" value={icing} onChange={e=>setIcing(e.target.value as any)}>
          <option value="buttercream">Buttercream</option>
          <option value="fondant">Fondant</option>
        </select>
        <select className="border rounded px-2 py-1" value={complexity} onChange={e=>setComplexity(e.target.value as any)}>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
          <option value="couture">Couture</option>
        </select>
        <input className="border rounded px-2 py-1" type="number" min={0} value={deliveryMiles} onChange={e=>setDeliveryMiles(parseInt(e.target.value||"0",10))} placeholder="Delivery miles" />
      </div>
      <AiSuggestButton onClick={run} />
      {output && (
        <div className="mt-3 text-sm">
          <div>Total: <span className="font-semibold">${output.total}</span></div>
          <div>Range: ${output.range.low} – ${output.range.high}</div>
          <div className="opacity-70">Servings: {output.servings}</div>
          <button
            type="button"
            onClick={() => onApplyTotal?.(output.total)}
            className="mt-2 px-3 py-1 rounded-lg border text-xs hover:bg-gray-50"
          >
            Apply to Quote Total
          </button>
        </div>
      )}
    </div>
  );
}
