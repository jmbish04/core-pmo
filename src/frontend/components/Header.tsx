import { HomeIcon } from "lucide-react";
import * as React from "react";

import { Icons } from "@/components/Icons";
import { MainNav } from "@/components/MainNav";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Header() {
  const [starCount, setStarCount] = React.useState<string>("—");

  React.useEffect(() => {
    async function fetchStars() {
      try {
        const githubUrl = new URL(siteConfig.links.github);
        const [, owner, repo] = githubUrl.pathname.split("/");

        if (!owner || !repo) return;

        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

        if (!res.ok) return;

        const json: { stargazers_count?: number } = await res.json();
        const stars = json.stargazers_count ?? 0;

        const formatted = stars >= 1000 ? `${Math.round(stars / 1000)}k` : stars.toLocaleString();

        setStarCount(formatted);
      } catch {
        setStarCount("—");
      }
    }

    fetchStars();
  }, []);

  return (
    <header className="top-0 bg-background sticky z-50 w-full">
      <div className="container-wrapper px-6 3xl:fixed:px-0">
        <div className="**:data-[slot=separator]:h-4! 3xl:fixed:container flex h-(--header-height) items-center">
          <MobileNav className="lg:hidden flex" />

          <a
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-8 lg:flex hidden",
            )}
          >
            <HomeIcon className="size-5" />
            <span className="sr-only">Home</span>
          </a>

          <MainNav className="lg:flex hidden" />

          <div className="gap-2 md:flex-1 md:justify-end ml-auto flex items-center">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-2 inline-flex items-center shadow-none",
              )}
            >
              <Icons.gitHub />
              <span className="text-xs text-muted-foreground w-fit tabular-nums">{starCount}</span>
            </a>

            <Separator orientation="vertical" className="my-auto" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
