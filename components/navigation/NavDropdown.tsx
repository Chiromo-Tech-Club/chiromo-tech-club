"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface NavDropdownProps {
  label: string;
  items: { label: string; href: string }[];
}

export function NavDropdown({ label, items }: NavDropdownProps) {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1 text-sm text-ink/80 transition-colors hover:text-ink">
        {label}
        <ChevronDown size={14} />
      </PopoverTrigger>
      <PopoverContent className="min-w-[180px] rounded-2xl border border-line bg-white p-2 shadow-[0_20px_50px_rgba(23,20,15,0.12)]">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl px-3.5 py-2.5 text-sm text-ink-2 transition-colors hover:bg-cream hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
}
