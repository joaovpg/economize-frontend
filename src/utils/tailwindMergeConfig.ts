// Sufixos dos papéis definidos em styles/tokens/utilities/typography.css.
// O merge precisa reconhecê-los como tipografia para preservar as cores text-*.
// Raios e tamanhos nomeados vêm de styles/tokens/primitives/shape.css; sem registrá-los,
// o merge não resolve conflitos como rounded-surface × rounded-control ou h-10 × h-touch.
export const tailwindMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["title-page", "title", "body", "body-strong", "caption", "metric"],
        },
      ],
    },
    theme: {
      radius: ["control", "surface"],
      spacing: [
        "touch",
        "calendar",
        "menu",
        "month",
        "textarea",
        "state-loading",
        "state-error",
        "auth",
        "auth-card",
        "sidebar",
        "form-aside",
        "metric-min",
        "modal",
        "modal-mobile",
        "modal-inset-top",
        "modal-inset-right",
        "modal-inset-bottom",
        "modal-inset-left",
        "modal-mobile-inset-top",
        "modal-mobile-inset-right",
        "modal-mobile-inset-bottom",
        "modal-mobile-inset-left",
      ],
    },
  },
};
