import type { CatalogProduct } from "../types";

export const FIXTURE_NOW = new Date("2026-11-18T15:00:00Z");
const fresh = new Date("2026-11-18T09:00:00Z");
const old = new Date("2026-11-10T09:00:00Z");

const product = (
  data: Partial<CatalogProduct> & Pick<CatalogProduct, "id" | "name">,
): CatalogProduct => ({
  description: null,
  usageRecommendations: null,
  stockQuantity: 10,
  stockUpdatedAt: fresh,
  price: 1000,
  currency: "CRC",
  requiresPrescription: false,
  keywords: [],
  ...data,
});

const allergyKeywords = [
  { keyword: "alergia", language: "es", kind: "indication" as const },
  { keyword: "alergias", language: "es", kind: "indication" as const },
  { keyword: "allergy", language: "en", kind: "indication" as const },
  { keyword: "allergies", language: "en", kind: "indication" as const },
];

export const FIXTURE_CATALOG: readonly CatalogProduct[] = [
  product({
    id: "p-lora",
    name: "Loratadina 10 mg",
    stockQuantity: 12,
    price: 2500,
    keywords: allergyKeywords,
  }),
  product({
    id: "p-ceti",
    name: "Cetirizina 10 mg",
    stockQuantity: 0,
    price: 3200,
    keywords: allergyKeywords,
  }),
  product({
    id: "p-acet",
    name: "Acetaminofén 500 mg",
    stockQuantity: 40,
    price: 1800,
    keywords: [
      { keyword: "paracetamol", language: "es", kind: "synonym" },
      { keyword: "dolor de cabeza", language: "es", kind: "indication" },
      { keyword: "headache", language: "en", kind: "indication" },
      { keyword: "dor de cabeca", language: "pt", kind: "indication" },
      { keyword: "fiebre", language: "es", kind: "indication" },
    ],
  }),
  product({ id: "p-ibu", name: "Ibuprofeno 400 mg", stockQuantity: 25, price: 2200 }),
  product({
    id: "p-suero",
    name: "Suero oral sabor naranja",
    stockQuantity: null,
    stockUpdatedAt: null,
    price: 900,
  }),
  product({
    id: "p-jarabe",
    name: "Jarabe para la tos sin azúcar",
    stockQuantity: 6,
    stockUpdatedAt: old,
    price: 4300,
    keywords: [
      { keyword: "tos", language: "es", kind: "indication" },
      { keyword: "toux", language: "fr", kind: "indication" },
      { keyword: "cough", language: "en", kind: "indication" },
    ],
  }),
  product({
    id: "p-amox",
    name: "Amoxicilina 500 mg",
    stockQuantity: 15,
    price: 5600,
    requiresPrescription: true,
  }),
  product({
    id: "p-gola",
    name: "Pastillas para la garganta miel y limón",
    stockQuantity: 30,
    price: 1500,
    keywords: [
      { keyword: "halsschmerzen", language: "de", kind: "indication" },
      { keyword: "mal di gola", language: "it", kind: "indication" },
      { keyword: "dolor de garganta", language: "es", kind: "indication" },
    ],
  }),
];
