import * as React from 'react';

export function Tooltip({ label, children }: { label: string; children: React.ReactElement }) {
  const [show, setShow] = React.useState(false);
  let timer: any;
  
  const showSoon = () => {
    timer = setTimeout(() => setShow(true), 300);
  };
  
  const hide = () => {
    clearTimeout(timer);
    setShow(false);
  };
  
  return (
    <span
      className="relative inline-block"
      onMouseEnter={showSoon}
      onMouseLeave={hide}
      onFocus={showSoon}
      onBlur={hide}
    >
      {React.cloneElement(children, { 'aria-label': label })}
      {show && (
        <span
          role="tooltip"
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black text-white text-xs px-2 py-1 shadow-lg z-50 pointer-events-none"
        >
          {label}
        </span>
      )}
    </span>
  );
}
