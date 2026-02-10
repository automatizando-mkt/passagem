import { viagemFormSchema, type ViagemFormData } from "../schemas";

describe("viagemFormSchema", () => {
  const validData: ViagemFormData = {
    itinerario_id: "550e8400-e29b-41d4-a716-446655440000",
    embarcacao_id: "660e8400-e29b-41d4-a716-446655440000",
    data_saida: "2026-03-15T08:00",
    observacoes: "",
  };

  it("deve aceitar dados validos completos", () => {
    const result = viagemFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("deve aceitar sem observacoes", () => {
    const result = viagemFormSchema.safeParse({
      ...validData,
      observacoes: "",
    });
    expect(result.success).toBe(true);
  });

  it("deve rejeitar sem itinerario_id", () => {
    const result = viagemFormSchema.safeParse({
      ...validData,
      itinerario_id: "",
    });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar sem embarcacao_id", () => {
    const result = viagemFormSchema.safeParse({
      ...validData,
      embarcacao_id: "",
    });
    expect(result.success).toBe(false);
  });

  it("deve rejeitar sem data_saida", () => {
    const result = viagemFormSchema.safeParse({
      ...validData,
      data_saida: "",
    });
    expect(result.success).toBe(false);
  });

  it("deve aceitar com observacoes opcionais", () => {
    const result = viagemFormSchema.safeParse({
      ...validData,
      observacoes: "Viagem especial de feriado",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.observacoes).toBe("Viagem especial de feriado");
    }
  });
});
