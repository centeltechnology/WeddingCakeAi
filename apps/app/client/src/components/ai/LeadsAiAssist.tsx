import React from "react";
import AiSuggestButton from "./AiSuggestButton";
import { aiLeadsAutoresponder } from "../../api/ai";

type Props = {
  bakeryName: string;
  defaultTone?: "friendly"|"formal"|"lux"|"casual";
  onInsertDraft?: (text: string) => void;
};

export default function LeadsAiAssist({ bakeryName, defaultTone = "friendly", onInsertDraft }: Props) {
  const [guestCount, setGuestCount] = React.useState<number | undefined>(undefined);
  const [eventType, setEventType] = React.useState<string>("");
  const [eventDate, setEventDate] = React.useState<string>("");
  const [styleNotes, setStyleNotes] = React.useState<string>("");
  const [tone, setTone] = React.useState<"friendly"|"formal"|"lux"|"casual">(defaultTone);
  const [reply, setReply] = React.useState<string>("");

  const run = async () => {
    const res = await aiLeadsAutoresponder({
      bakeryName, tone, guestCount, eventType, eventDate, styleNotes
    } as any);
    setReply(res.reply || "");
  };

  return (
    <div className="p-3 border rounded-xl bg-white/60 backdrop-blur-sm">
      <div className="text-sm font-medium mb-2">✨ AI Lead Reply</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input className="border rounded px-2 py-1" placeholder="Event type" value={eventType} onChange={e=>setEventType(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Event date" value={eventDate} onChange={e=>setEventDate(e.target.value)} />
        <input className="border rounded px-2 py-1" type="number" min={1} placeholder="Guests" onChange={e=>setGuestCount(parseInt(e.target.value||"0",10)||undefined)} />
        <select className="border rounded px-2 py-1" value={tone} onChange={e=>setTone(e.target.value as any)}>
          <option value="friendly">Friendly</option>
          <option value="formal">Formal</option>
          <option value="lux">Lux</option>
          <option value="casual">Casual</option>
        </select>
      </div>
      <textarea className="w-full border rounded px-2 py-1 text-sm" rows={3} placeholder="Style notes (optional)" value={styleNotes} onChange={e=>setStyleNotes(e.target.value)} />
      <div className="mt-2">
        <AiSuggestButton onClick={run} />
      </div>
      {reply && (
        <div className="mt-3">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Draft</div>
          <div className="text-sm p-2 border rounded-lg bg-white whitespace-pre-wrap">{reply}</div>
          <button
            type="button"
            onClick={() => onInsertDraft?.(reply)}
            className="mt-2 px-3 py-1 rounded-lg border text-xs hover:bg-gray-50"
          >
            Insert into Reply
          </button>
        </div>
      )}
    </div>
  );
}
