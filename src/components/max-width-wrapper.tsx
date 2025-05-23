import { cn } from "~/lib/utils";

export function MaxWidthWrapper({
  children,
  className,
  large = false,
}: {
  children: React.ReactNode;
  className?: string;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "container mx-auto px-[1rem]",
        large ? "max-w-screen-2xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
