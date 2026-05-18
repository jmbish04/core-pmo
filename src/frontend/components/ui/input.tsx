import { Input as InputPrimitive } from "@base-ui/react/input";
import * as React from "react";

import { cn } from "@frontend/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 min-w-0 rounded-md border-input px-2.5 py-1 text-base shadow-xs file:h-7 file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 w-full border bg-transparent transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-[3px]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
