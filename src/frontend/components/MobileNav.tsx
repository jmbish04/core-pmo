import * as React from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          className={cn(
            "extend-touch-target h-8 gap-2.5 p-0! touch-manipulation items-center justify-start hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent",
            className,
          )}
        >
          <div className="h-8 w-4 relative flex items-center justify-center">
            <div className="size-4 relative">
              <span
                className={cn(
                  "left-0 h-0.5 w-4 bg-foreground absolute block transition-all duration-100",
                  open ? "top-[0.4rem] -rotate-45" : "top-1",
                )}
              />
              <span
                className={cn(
                  "left-0 h-0.5 w-4 bg-foreground absolute block transition-all duration-100",
                  open ? "top-[0.4rem] rotate-45" : "top-2.5",
                )}
              />
            </div>
            <span className="sr-only">Toggle Menu</span>
          </div>
          <span className="h-8 text-lg font-medium flex items-center leading-none">Menu</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="no-scrollbar bg-background/90 p-0 backdrop-blur h-(--available-height) w-(--available-width) overflow-y-auto rounded-none border-none shadow-none duration-100"
        align="start"
        side="bottom"
        alignOffset={-16}
        sideOffset={12}
      >
        <div className="gap-12 px-6 py-6 flex flex-col overflow-auto">
          <div className="gap-4 flex flex-col">
            <div className="text-sm font-medium text-muted-foreground">Menu</div>

            <div className="gap-3 flex flex-col">
              <a href="/" className="text-2xl font-medium" onClick={() => setOpen(false)}>
                Home
              </a>

              {siteConfig.navItems.map((item) => (
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className="text-2xl font-medium"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
