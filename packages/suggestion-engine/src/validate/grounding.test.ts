import { describe, expect, it } from "vitest";
import { findUngroundedNumbers, isGrounded } from "./grounding";

describe("validador de veracidad", () => {
  const sources = ["Loratadina 10 mg", "₡2.500"];

  it("acepta cifras presentes en los datos de origen", () => {
    expect(isGrounded("Tenemos Loratadina 10 mg a ₡2.500.", sources)).toBe(true);
    expect(isGrounded("We have Loratadina 10 mg for ₡2,500.", sources)).toBe(true);
  });

  it("detecta precios, cantidades o dosis inventadas", () => {
    expect(
      findUngroundedNumbers("Tenemos 12 unidades de Loratadina 20 mg a ₡1.900", sources),
    ).toEqual(["12", "20", "1900"]);
  });
});
