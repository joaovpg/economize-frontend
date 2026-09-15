import { forwardRef, type ReactNode } from "react";

import { createLink, type LinkComponent } from "@tanstack/react-router";
import { tv, type VariantProps } from "tailwind-variants";

import { buttonStyles } from "./Button/buttonStyles";
import { IconSlot } from "./IconSlot";

const linkStyles = tv(
  {
    extend: buttonStyles,
    variants: {
      linkVariant: {
        default: "",
        brand: "gap-3 font-bold tracking-tight",
        compactBrand: "gap-2.5 text-title-compact tracking-tight text-foreground! no-underline",
        header: "font-bold [&>span>svg]:size-4",
        back: "text-caption",
        navigation:
          "!h-11 !min-h-11 !rounded-full !px-3 text-button !text-muted no-underline data-hovered:!text-foreground data-hovered:no-underline max-[28rem]:!px-2.5 max-[28rem]:[&>span>svg]:hidden",
      },
      active: {
        false: "",
        true: "!bg-brand-soft !text-brand-hover shadow-nav-active",
      },
    },
    defaultVariants: {
      linkVariant: "default",
      active: false,
    },
  },
  { twMerge: false },
);

type StyledLinkProps = Omit<React.ComponentPropsWithoutRef<"a">, "children" | "className"> &
  VariantProps<typeof linkStyles> & {
    className?: string;
    children?: ReactNode;
    /** Ícone decorativo exibido antes do conteúdo visível. */
    leadingIcon?: ReactNode;
    /** Ícone decorativo exibido depois do conteúdo visível. */
    trailingIcon?: ReactNode;
  };

function StyledLink(
  {
    children,
    className,
    active = false,
    emphasis = "default",
    isIconOnly = false,
    leadingIcon,
    linkVariant = "default",
    size = "md",
    trailingIcon,
    variant = "link",
    ...linkProps
  }: StyledLinkProps,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <a
      {...linkProps}
      ref={ref}
      className={linkStyles({
        active,
        className,
        emphasis,
        isIconOnly,
        linkVariant,
        size,
        variant,
      })}
    >
      {!isIconOnly && leadingIcon && <IconSlot>{leadingIcon}</IconSlot>}
      {isIconOnly ? <IconSlot>{children}</IconSlot> : children}
      {!isIconOnly && trailingIcon && <IconSlot>{trailingIcon}</IconSlot>}
    </a>
  );
}

const StyledLinkWithRef = forwardRef(StyledLink);

/**
 * Link visual do Economize sobre o link do TanStack Router.
 *
 * O `createLink` mantém `to`, `params`, `search` e `preload` ligados à árvore de rotas gerada. Isso
 * faz com que links internos e seus parâmetros sejam verificados pelo TypeScript no ponto de uso. O
 * Router também adiciona o preloading por intenção configurado em `src/main.tsx`.
 */
export const Link: LinkComponent<typeof StyledLinkWithRef> = createLink(StyledLinkWithRef);
