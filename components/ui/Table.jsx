import { cn } from "@/lib/cn";

// Lightweight styled table primitives. Use them like a normal HTML table:
//   <Table><THead>...<Tr><Th/></Tr></THead><TBody><Tr><Td/></Tr></TBody></Table>

export function Table({ className, children }) {
  return (
    <div className="overflow-x-auto rounded-card border border-black/[0.07] bg-card">
      <table className={cn("w-full min-w-[640px] text-left text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="border-b border-black/[0.06] text-[11px] uppercase tracking-widest text-black/40">
      {children}
    </thead>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-black/[0.05]">{children}</tbody>;
}

export function Tr({ className, children, ...props }) {
  return (
    <tr
      className={cn("transition-colors duration-200", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function Th({ className, children, ...props }) {
  return (
    <th className={cn("px-4 py-3 font-normal", className)} {...props}>
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }) {
  return (
    <td className={cn("px-4 py-3 align-middle", className)} {...props}>
      {children}
    </td>
  );
}
