// Sufixos dos papéis definidos em styles/tokens/utilities/typography.css.
// O merge precisa reconhecê-los como tipografia para preservar as cores text-*.
export const tailwindMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["title-page", "title", "body", "body-strong", "caption", "metric"],
        },
      ],
    },
  },
};
