import type { OptionsGroupReceipt, ReceiptShape } from "@/types/receipt";

const frutas: OptionsGroupReceipt = {
  name: "Frutas",
  required: true,
  options: [
    { name: "Abacate" },
    { name: "Banana" },
    { name: "Morango", value: 2 },
    { name: "Kiwi", value: 3 },
  ],
};

const base_guarana: OptionsGroupReceipt = {
  name: "Base de Guaraná",
  required: true,
  options: [{ name: "Xarope", default: true }, { name: "Pó" }],
};

const calda: OptionsGroupReceipt = {
  name: "Calda",
  required: true,
  options: [{ name: "Chocolate", default: true }, { name: "Leite Condensado" }],
};

const whey: OptionsGroupReceipt = {
  name: "Whey protein",
  required: true,
  options: [
    { name: "1 Scoop", default: true },
    { name: "2 Scoop", value: 2.5 },
  ],
};

const guarana_default_300: ReceiptShape = {
  name: "Guaraná Tradicional",
  size: 300,
  value: 20.0,
  ingredients: [
    { name: "Castanha de Cajú" },
    { name: "Amendoim" },
    { name: "Leite Integral" },
    base_guarana,
    frutas,
    calda,
  ],
};

const guarana_default_500: ReceiptShape = {
  ...guarana_default_300,
  value: 25,
  size: 500,
};

const guarana_maromba_300: ReceiptShape = {
  name: "Guaraná Fit com Whey Protein",
  value: 25,
  size: 300,
  ingredients: [
    { name: "Leite Integral" },
    { name: "Aveia" },
    { name: "Mel" },
    { name: "Amendoim" },
    frutas,
    whey,
    base_guarana,
  ],
};

const guarana_maromba_500: ReceiptShape = {
  ...guarana_maromba_300,
  value: 30,
  size: 500,
};

export const receipts: ReceiptShape[] = [
  guarana_default_300,
  guarana_default_500,
  guarana_maromba_300,
  guarana_maromba_500,
];
