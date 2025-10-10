import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

type Variant = 'primary' | 'secondary' | 'outline' | 'outline-light' | 'ghost' | 'danger' | 'success';
type Size = 'xs' | 'sm' | 'md' | 'lg';

const base = "inline-flex items-center justify-center gap-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed";

const sizeCls: Record<Size, string> = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base"
};

/* IMPORTANT: no white-on-white anywhere */
const varCls: Record<Variant, string> = {
  primary: "bg-[var(--brand)] text-white hover:bg-black",
  secondary: "bg-[var(--brand-600)] text-white hover:bg-[var(--brand)]",
  outline: "border border-[var(--brand-500)] text-[var(--brand)] bg-transparent hover:bg-[var(--accent)]",
  'outline-light': "border border-white/60 text-white bg-transparent hover:bg-white/10", /* for dark header */
  ghost: "text-[var(--brand)] hover:bg-[var(--accent)]",
  danger: "bg-[var(--danger)] text-white hover:bg-red-600",
  success: "bg-[var(--success)] text-white hover:bg-green-600",
};

export function Spinner() {
  return <div aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  href?: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function Button({
  asChild = false,
  href,
  variant = 'primary',
  size = 'sm',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const cls = `${base} ${sizeCls[size]} ${varCls[variant]} ${className}`;

  // If asChild is true, use Slot to merge props with child element
  if (asChild) {
    return (
      <Slot className={cls} {...rest}>
        {children}
      </Slot>
    );
  }

  // Link-as-button
  if (href) {
    return (
      <a href={href} className={cls} {...(rest as any)}>
        {loading ? <Spinner /> : leftIcon}
        <span>{children}</span>
        {rightIcon}
      </a>
    );
  }

  // Regular button
  return (
    <button className={cls} aria-busy={loading || undefined} {...rest}>
      {loading ? <Spinner /> : leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
}

/** Minimal button group for segmented actions */
export function ButtonGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-stretch [&>*]:rounded-none [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg">
      {children}
    </div>
  );
}

// Legacy compat exports
export { Button as default };
export const buttonVariants = (opts: { variant?: Variant; size?: Size }) => {
  const v = opts.variant || 'primary';
  const s = opts.size || 'sm';
  return `${base} ${sizeCls[s]} ${varCls[v]}`;
};
