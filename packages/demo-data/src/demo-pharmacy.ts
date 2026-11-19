import type { CatalogProduct } from "@yigora/suggestion-engine";
import {
  ALLERGY,
  COUGH,
  DEHYDRATION,
  HEARTBURN,
  INFLAMMATION,
  keywords,
  PAIN_AND_FEVER,
  SORE_THROAT,
} from "./keywords";

/**
 * Farmacia FICTICIA para demostraciones. Precios, existencias y textos son inventados y
 * NO constituyen información farmacéutica real.
 */
export const DEMO_ORGANIZATION = {
  name: "Farmacia Demo Yigora (ficticia)",
  defaultLanguage: "es",
  currency: "CRC",
  staleAfterHours: 24,
} as const;

const DEMO_NOTICE = "Dato ficticio de demostración.";
const DEMO_USAGE = "Ficticio: seguir las indicaciones del empaque y consultar al farmacéutico.";
const HOUR = 60 * 60 * 1000;

interface DemoProductSeed {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly stockQuantity: number | null;
  readonly price: number | null;
  /** Antigüedad del dato de stock en horas; null = sin fecha. */
  readonly stockAgeHours: number | null;
  readonly requiresPrescription?: boolean;
  readonly keywords?: CatalogProduct["keywords"];
}

const SEEDS: readonly DemoProductSeed[] = [
  {
    id: "demo-01",
    name: "Loratadina 10 mg",
    description: "Antihistamínico, caja de 10 tabletas.",
    stockQuantity: 12,
    price: 2500,
    stockAgeHours: 2,
    keywords: [...ALLERGY, ...keywords("synonym", { en: ["loratadine"], it: ["loratadina"] })],
  },
  {
    id: "demo-02",
    name: "Cetirizina 10 mg",
    description: "Antihistamínico, caja de 10 tabletas.",
    stockQuantity: 0,
    price: 3200,
    stockAgeHours: 3,
    keywords: [...ALLERGY, ...keywords("synonym", { en: ["cetirizine"] })],
  },
  {
    id: "demo-03",
    name: "Acetaminofén 500 mg",
    description: "Analgésico y antipirético, caja de 20 tabletas.",
    stockQuantity: 40,
    price: 1800,
    stockAgeHours: 1,
    keywords: [
      ...PAIN_AND_FEVER,
      ...keywords("synonym", {
        es: ["paracetamol"],
        en: ["acetaminophen", "paracetamol"],
        pt: ["paracetamol"],
        fr: ["paracétamol"],
        de: ["Paracetamol"],
        it: ["paracetamolo"],
      }),
    ],
  },
  {
    id: "demo-04",
    name: "Ibuprofeno 400 mg",
    description: "Antiinflamatorio, caja de 10 tabletas.",
    stockQuantity: 25,
    price: 2200,
    stockAgeHours: 1,
    keywords: [...INFLAMMATION, ...keywords("synonym", { en: ["ibuprofen"], de: ["Ibuprofen"] })],
  },
  {
    id: "demo-05",
    name: "Suero oral sabor naranja 500 ml",
    description: "Solución de rehidratación oral.",
    stockQuantity: null,
    price: 900,
    stockAgeHours: null,
    keywords: DEHYDRATION,
  },
  {
    id: "demo-06",
    name: "Omeprazol 20 mg",
    description: "Caja de 14 cápsulas.",
    stockQuantity: 8,
    price: 3900,
    stockAgeHours: 4,
    keywords: [...HEARTBURN, ...keywords("synonym", { en: ["omeprazole"] })],
  },
  {
    id: "demo-07",
    name: "Amoxicilina 500 mg",
    description: "Antibiótico, caja de 21 cápsulas.",
    stockQuantity: 15,
    price: 5600,
    stockAgeHours: 2,
    requiresPrescription: true,
    keywords: keywords("synonym", {
      en: ["amoxicillin", "antibiotic"],
      es: ["antibiótico"],
      pt: ["antibiótico"],
      fr: ["antibiotique"],
      de: ["Antibiotikum"],
      it: ["antibiotico"],
    }),
  },
  {
    id: "demo-08",
    name: "Jarabe para la tos sin azúcar 120 ml",
    description: "Jarabe sin azúcar.",
    stockQuantity: 6,
    price: 4300,
    stockAgeHours: 6 * 24,
    keywords: [
      ...COUGH,
      ...keywords("synonym", {
        en: ["cough syrup"],
        pt: ["xarope"],
        fr: ["sirop"],
        de: ["Hustensaft"],
        it: ["sciroppo"],
      }),
    ],
  },
  {
    id: "demo-09",
    name: "Pastillas para la garganta miel y limón",
    description: "Caja de 16 pastillas.",
    stockQuantity: 30,
    price: 1500,
    stockAgeHours: 2,
    keywords: [
      ...SORE_THROAT,
      ...keywords("synonym", {
        en: ["lozenges"],
        pt: ["pastilhas"],
        fr: ["pastilles"],
        de: ["Lutschtabletten"],
        it: ["pastiglie"],
      }),
    ],
  },
  {
    id: "demo-10",
    name: "Protector solar FPS 50",
    description: "Loción de 120 ml.",
    stockQuantity: 9,
    price: 9500,
    stockAgeHours: 5,
    keywords: keywords("synonym", {
      es: ["bloqueador", "protector solar", "sol"],
      en: ["sunscreen", "sunblock"],
      pt: ["protetor solar"],
      fr: ["crème solaire"],
      de: ["Sonnencreme"],
      it: ["crema solare"],
    }),
  },
  {
    id: "demo-11",
    name: "Repelente de insectos",
    description: "Atomizador de 100 ml.",
    stockQuantity: 0,
    price: 4800,
    stockAgeHours: 2,
    keywords: keywords("synonym", {
      es: ["repelente", "zancudos", "mosquitos"],
      en: ["insect repellent", "mosquito repellent", "repellent"],
      pt: ["repelente"],
      fr: ["répulsif"],
      de: ["Mückenschutz"],
      it: ["repellente"],
    }),
  },
  {
    id: "demo-12",
    name: "Alcohol en gel 250 ml",
    description: "Gel antibacterial.",
    stockQuantity: 50,
    price: 1900,
    stockAgeHours: 2,
    keywords: keywords("synonym", {
      es: ["gel antibacterial"],
      en: ["hand sanitizer"],
      pt: ["álcool em gel"],
      fr: ["gel hydroalcoolique"],
      de: ["Desinfektionsgel"],
      it: ["gel igienizzante"],
    }),
  },
  {
    id: "demo-13",
    name: "Vitamina C 1000 mg",
    description: "Tubo de 10 tabletas efervescentes.",
    stockQuantity: 20,
    price: 3500,
    stockAgeHours: 3,
    keywords: keywords("synonym", { en: ["vitamin c"], fr: ["vitamine c"], de: ["Vitamin C"] }),
  },
  {
    id: "demo-14",
    name: "Termómetro digital",
    description: "Termómetro de uso oral y axilar.",
    stockQuantity: 4,
    price: 6500,
    stockAgeHours: 8,
    keywords: keywords("synonym", {
      en: ["thermometer"],
      pt: ["termômetro"],
      fr: ["thermomètre"],
      de: ["Thermometer"],
      it: ["termometro"],
    }),
  },
  {
    id: "demo-15",
    name: "Curitas adhesivas surtidas",
    description: "Caja de 30 unidades.",
    stockQuantity: 100,
    price: 1200,
    stockAgeHours: 2,
    keywords: keywords("synonym", {
      es: ["curitas", "vendas", "banditas"],
      en: ["band-aids", "bandages", "plasters"],
      pt: ["curativos"],
      fr: ["pansements"],
      de: ["Pflaster"],
      it: ["cerotti"],
    }),
  },
  {
    id: "demo-16",
    name: "Gotas lubricantes para ojos 15 ml",
    description: "Lágrimas artificiales.",
    stockQuantity: null,
    price: 4200,
    stockAgeHours: null,
    keywords: keywords("indication", {
      es: ["ojos secos", "gotas para los ojos"],
      en: ["dry eyes", "eye drops"],
      pt: ["olhos secos", "colírio"],
      fr: ["yeux secs", "gouttes pour les yeux"],
      de: ["trockene Augen", "Augentropfen"],
      it: ["occhi secchi", "collirio"],
    }),
  },
  {
    id: "demo-17",
    name: "Crema para picaduras",
    description: "Tubo de 30 g.",
    stockQuantity: 7,
    price: 2900,
    stockAgeHours: 4,
    keywords: keywords("indication", {
      es: ["picaduras", "piquetes"],
      en: ["insect bites", "bites"],
      pt: ["picadas"],
      fr: ["piqûres"],
      de: ["Insektenstiche"],
      it: ["punture"],
    }),
  },
];

/** Construye el catálogo ficticio con fechas de stock relativas a `now`. */
export function createDemoCatalog(now: Date = new Date()): CatalogProduct[] {
  return SEEDS.map((seed) => ({
    id: seed.id,
    name: seed.name,
    description: `${seed.description} ${DEMO_NOTICE}`,
    usageRecommendations: DEMO_USAGE,
    stockQuantity: seed.stockQuantity,
    stockUpdatedAt:
      seed.stockAgeHours === null ? null : new Date(now.getTime() - seed.stockAgeHours * HOUR),
    price: seed.price,
    currency: DEMO_ORGANIZATION.currency,
    requiresPrescription: seed.requiresPrescription ?? false,
    keywords: seed.keywords ?? [],
  }));
}
