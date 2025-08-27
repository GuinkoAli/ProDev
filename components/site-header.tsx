"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/polls", label: "Polls" },
  { href: "/polls/new", label: "Create" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          Polly
        </Link>
        <nav className="flex items-center gap-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm text-gray-700 hover:text-black",
                pathname === item.href && "text-black font-medium"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}


