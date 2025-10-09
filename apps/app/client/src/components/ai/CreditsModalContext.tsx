import React from "react";

type Ctx = {
  open: (opts?: { reason?: string; needed?: number; have?: number }) => void;
  close: () => void;
};
export const CreditsModalContext = React.createContext<Ctx | null>(null);

export function useCreditsModal() {
  const ctx = React.useContext(CreditsModalContext);
  if (!ctx) throw new Error("CreditsModalContext missing");
  return ctx;
}

type ModalProps = { 
  onClose: () => void; 
  meta?: { reason?: string; needed?: number; have?: number } 
};

const BuyCreditsModalInternal = React.lazy<React.ComponentType<ModalProps>>(() => 
  // @ts-ignore - TypeScript can't verify lazy module at compile time
  import("./BuyCreditsModal") as Promise<{ default: React.ComponentType<ModalProps> }>
);

export function CreditsModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);
  const [meta, setMeta] = React.useState<{ reason?: string; needed?: number; have?: number } | null>(null);
  const open = (opts?: { reason?: string; needed?: number; have?: number }) => { setMeta(opts || null); setVisible(true); };
  const close = () => setVisible(false);

  return (
    <CreditsModalContext.Provider value={{ open, close }}>
      {children}
      {/* Portal-friendly: render modal here */}
      <div id="credits-modal-root" style={{ position:"relative", zIndex: 1000 }}>
        {visible && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-4">
              {/* lazy import the real modal to avoid SSR quirks */}
              <React.Suspense fallback={<div>Loading…</div>}>
                <BuyCreditsModalInternal onClose={close} meta={meta || undefined} />
              </React.Suspense>
            </div>
          </div>
        )}
      </div>
    </CreditsModalContext.Provider>
  );
}
