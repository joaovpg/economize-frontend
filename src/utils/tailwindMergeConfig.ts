// Sufixos dos papéis definidos em styles/tokens/utilities/typography.css.
// O merge precisa reconhecê-los como tipografia para preservar as cores text-*.
export const tailwindMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-hero",
            "page-title",
            "section-title",
            "card-title",
            "title-compact",
            "metric",
            "body-large",
            "body",
            "body-small",
            "label",
            "button",
            "caption",
            "caption-strong",
            "validation",
            "meta",
            "code",
            "token",
          ],
        },
      ],
    },
  },
};
