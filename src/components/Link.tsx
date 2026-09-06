import { forwardRef, type ReactNode } from "react";

import { createLink } from "@tanstack/react-router";

import { buttonStyles, type ButtonStyleProps } from "./Button/buttonStyles";
import { IconSlot } from "./IconSlot";

type StyledLinkProps = Omit<React.ComponentPropsWithoutRef<"a">, "children" | "className"> &
  ButtonStyleProps & {
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
    isIconOnly = false,
    leadingIcon,
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
      className={buttonStyles({
        className,
        isIconOnly,
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
 * Router também adiciona o preloading por intenção configurado em `src/router.tsx`.
 */
export const Link = createLink(StyledLinkWithRef);
