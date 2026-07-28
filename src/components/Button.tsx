import Link from "next/link";

export default function Button({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "light";
}) {
  const styles =
    variant === "dark"
      ? "border-ink text-ink hover:bg-ink hover:text-paper"
      : "border-paper text-paper hover:bg-paper hover:text-ink";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 border px-6 py-3 font-heading text-sm tracking-widest transition-colors ${styles}`}
    >
      {children}
      <span>_</span>
    </Link>
  );
}
