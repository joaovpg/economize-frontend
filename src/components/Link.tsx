import { forwardRef, type ReactNode } from "react";

import { createLink, type LinkComponent } from "@tanstack/react-router";

import { tv } from "../utils/tailwind";
import { buttonStyles } from "./Button/buttonStyles";
import { IconSlot } from "./IconSlot";

import type { VariantProps } from "tailwind-variants";

const linkStyles = tv(
  {
    defaultVariants: {
      active: false,
      linkVariant: "default",
    },
    extend: buttonStyles,
    variants: {
      linkVariant: {
        back: "text-caption",
        brand: "gap-3",
        compactBrand: "gap-2 text-title no-underline",
        default: "",
        header: "[&>span>svg]:size-4",
        navigation:
          "h-auto! min-h-0! rounded-full! px-3! py-1! text-body-strong no-underline data-hovered:no-underline max-sm:px-2!",
      },
      active: {
        false: "",
        true: "",
      },
    },
    // As cores ficam em `compoundVariants` porque elas são aplicadas depois das variantes do botão
    // estendido, então o merge mantém a cor do link e descarta a cor da variante `link` do botão.
    compoundVariants: [
      { class: "text-foreground", linkVariant: "compactBrand" },
      { class: "text-muted data-hovered:text-foreground", linkVariant: "navigation" },
      { active: true, class: "bg-brand-soft text-brand-hover" },
    ],
  },
  // Explícito porque `buttonStyles` desliga o merge e a configuração é herdada pelo `extend`.
  { twMerge: true },
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
