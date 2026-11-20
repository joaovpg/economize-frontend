import { extendTailwindMerge } from "tailwind-merge";
import { cnMerge, createTV, type CnOptions, type CnReturn } from "tailwind-variants";

import { tailwindMergeConfig } from "./tailwindMergeConfig";

// Importe `twMerge`, `tv` e `cn` daqui, e não dos pacotes originais: a configuração registra os
// papéis tipográficos customizados. Sem ela, o merge trata `text-*` desconhecido como cor e remove
// o papel tipográfico quando ele é combinado a uma classe de cor.
export const twMerge = extendTailwindMerge(tailwindMergeConfig);

export const tv = createTV({ twMergeConfig: tailwindMergeConfig });

export function cn(...classnames: CnOptions): CnReturn {
  return cnMerge(...classnames)({ twMergeConfig: tailwindMergeConfig });
}
