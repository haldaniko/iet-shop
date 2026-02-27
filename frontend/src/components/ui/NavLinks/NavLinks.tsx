import Link from "next/link";

export type SimpleLink = {
  label: string;
  href: string;
  external?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

interface NavLinksProps {
  links: SimpleLink[];

  linkClassName?: string;
  /**
   * Если true — каждая ссылка будет обёрнута в <li>, удобно для меню в хедере.
   * Если false — будут отрендерены только <Link>/<a>, удобно для футера.
   */
  asListItems?: boolean;
}

export const NavLinks = ({
  links,
  linkClassName,
  asListItems = false,
}: NavLinksProps) => {
  return (
    <>
      {links.map((item) => {
        const isExternal = item.external || item.href.startsWith("http");

        const content = isExternal ? (
          <a
            href={item.href}
            className={linkClassName}
            target="_blank"
            rel="noreferrer"
            onClick={item.onClick}
          >
            {item.label}
          </a>
        ) : (
          <Link href={item.href} className={linkClassName} onClick={item.onClick}>
            {item.label}
          </Link>
        );

        if (!asListItems) {
          return (
            <span key={`${item.label}-${item.href}`}>
              {content}
            </span>
          );
        }

        return (
          <li key={`${item.label}-${item.href}`}>
            {content}
          </li>
        );
      })}
    </>
  );
};

