import Image from "next/image";
import { cn } from "@/shared/lib/cn";

/** Щит MoneyWarden в светлой плашке (как иконка приложения). */
export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[28%] bg-[#f5f4f0] ring-1 ring-black/5",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="MoneyWarden"
        width={size}
        height={size}
        className="mix-blend-multiply"
        style={{ width: size * 0.68, height: size * 0.68 }}
        priority
      />
    </span>
  );
}
