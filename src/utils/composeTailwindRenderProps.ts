import { composeRenderProps } from "react-aria-components";

import { twMerge } from "tailwind-merge";

export function composeTailwindRenderProps<T>(
  classNames: string | ((v: T) => string) | undefined,
  tw: string,
): string | ((v: T) => string) {
  return composeRenderProps(classNames, (className) => twMerge(tw, className));
}
