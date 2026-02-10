// Mock next/cache before import
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock supabase-server
const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockInsert = jest.fn(() => ({ select: mockSelect }));
const mockUpdate = jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) }));
const mockEq = jest.fn(() => Promise.resolve({ error: null }));
const mockFrom = jest.fn((table: string) => ({
  insert: mockInsert,
  update: (data: unknown) => {
    mockUpdate(data);
    return { eq: mockEq };
  },
}));

jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(() =>
    Promise.resolve({ from: mockFrom })
  ),
}));

import { createViagem, updateViagem, updateViagemStatus } from "../actions";

beforeEach(() => {
  jest.clearAllMocks();
  mockSingle.mockResolvedValue({ data: { id: "new-id" }, error: null });
  mockEq.mockResolvedValue({ error: null });
});

describe("createViagem", () => {
  const validData = {
    itinerario_id: "550e8400-e29b-41d4-a716-446655440000",
    embarcacao_id: "660e8400-e29b-41d4-a716-446655440000",
    data_saida: "2026-03-15T08:00",
    observacoes: "",
  };

  it("deve retornar sucesso com dados validos", async () => {
    const result = await createViagem(validData);
    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("viagens");
    expect(mockInsert).toHaveBeenCalledWith({
      itinerario_id: validData.itinerario_id,
      embarcacao_id: validData.embarcacao_id,
      data_saida: validData.data_saida,
      observacoes: null,
    });
  });

  it("deve retornar erro com dados invalidos", async () => {
    const result = await createViagem({
      ...validData,
      itinerario_id: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it("deve retornar erro quando Supabase falha", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "DB error" },
    });
    const result = await createViagem(validData);
    expect(result.success).toBe(false);
  });

  it("deve converter observacoes vazia para null", async () => {
    await createViagem(validData);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ observacoes: null })
    );
  });
});

describe("updateViagem", () => {
  const validData = {
    itinerario_id: "550e8400-e29b-41d4-a716-446655440000",
    embarcacao_id: "660e8400-e29b-41d4-a716-446655440000",
    data_saida: "2026-03-15T10:00",
    observacoes: "Alteracao",
  };

  it("deve retornar sucesso ao atualizar", async () => {
    const result = await updateViagem("viagem-id", validData);
    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("viagens");
  });

  it("deve retornar erro com dados invalidos", async () => {
    const result = await updateViagem("viagem-id", {
      ...validData,
      embarcacao_id: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateViagemStatus", () => {
  it("deve atualizar o status da viagem", async () => {
    const result = await updateViagemStatus("viagem-id", "embarque");
    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith("viagens");
    expect(mockUpdate).toHaveBeenCalledWith({ status: "embarque" });
  });
});
