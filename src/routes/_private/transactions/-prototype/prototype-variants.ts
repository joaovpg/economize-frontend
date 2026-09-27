export const prototypeVariantValues = ["reference", "ledger", "focus"] as const;

export type PrototypeVariant = (typeof prototypeVariantValues)[number];
