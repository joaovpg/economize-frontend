import { type ReactNode, type Ref } from "react";
import {
  Link as AriaLink,
  composeRenderProps,
  type LinkProps as AriaLinkProps,
  type LinkRenderProps,
} from "react-aria-components";
import { Link as RouterLink } from "react-router-dom";

import { buttonStyles, type ButtonStyleProps } from "./Button/buttonStyles";
import { IconSlot } from "./IconSlot";

export type LinkProps = Omit<AriaLinkProps, "className"> &
  ButtonStyleProps & {
    className?: AriaLinkProps["className"];
    ref?: Ref<HTMLAnchorElement>;
    /** Ícone decorativo exibido antes do conteúdo visível. */
    leadingIcon?: ReactNode;
    /** Ícone decorativo exibido depois do conteúdo visível. */
    trailingIcon?: ReactNode;
  };

/**
 * Link de navegação do Economize, com as mesmas variantes visuais do Button.
 *
 * Use `href` para navegação nativa ou `render` para delegar a navegação ao roteador da aplicação. O
 * componente preserva a semântica de link mesmo quando recebe uma variante visual de botão.
 *
 * @see https://react-aria.adobe.com/Link
 */
export function Link({
  children,
  className,
  isIconOnly = false,
  leadingIcon,
  size = "md",
  trailingIcon,
  variant = "link",
  ref,
  ...linkProps
}: LinkProps) {
  const resolvedClassName = composeRenderProps(
    className,
    (userClassName: string | undefined, _renderProps: LinkRenderProps) =>
      buttonStyles({
        className: userClassName,
        isIconOnly,
        size,
        variant,
      }),
  );

  const resolvedChildren = composeRenderProps(
    children,
    (content: ReactNode, _renderProps: LinkRenderProps) => (
      <>
        {!isIconOnly && leadingIcon && <IconSlot>{leadingIcon}</IconSlot>}
        {isIconOnly ? <IconSlot>{content}</IconSlot> : content}
        {!isIconOnly && trailingIcon && <IconSlot>{trailingIcon}</IconSlot>}
      </>
    ),
  );

  return (
    <AriaLink
      {...linkProps}
      ref={ref}
      className={resolvedClassName}
      render={(props) => {
        if (!("href" in props)) {
          return <span {...props} />;
        }

        const { href, ...routerProps } = props;
        return <RouterLink {...routerProps} to={href} />;
      }}
    >
      {resolvedChildren}
    </AriaLink>
  );
}
