import { siteConfig } from "@frontend/lib/config";

export function Footer() {
  return (
    <footer className="group-has-[.section-soft]/body:bg-surface/40 3xl:fixed:bg-transparent dark:bg-transparent">
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex h-(--footer-height) items-center justify-between">
          <div className="px-1 text-xs leading-loose text-muted-foreground sm:text-sm w-full text-center">
            Built by{" "}
            <a
              href={siteConfig.author.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              {siteConfig.author.name}
            </a>{" "}
            . The source code is available on{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </div>
        </div>
      </div>
    </footer>
  );
}
