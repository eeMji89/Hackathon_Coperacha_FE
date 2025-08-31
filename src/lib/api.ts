// src/lib/api.ts
import { getJSON, postJSON } from "@/lib/rest";

/** ---- Validación de wallet (ajusta la ruta si tu backend usa otra) ---- */
export async function validateWallet(address: string): Promise<boolean> {
  try {
    const res = await getJSON<{ exists: boolean }>(
      `/wallets/validate?address=${encodeURIComponent(address)}`
    );
    return !!res?.exists;
  } catch {
    // fallback dev: pasa si parece dirección o ENS
    const hex42 = /^0x[a-fA-F0-9]{40}$/;
    const ens = /^[a-z0-9-]+\.eth$/i;
    return hex42.test(address) || ens.test(address);
  }
}

/** ---- Crear usuario: POST /createUser con llaves en español ---- */
export type CreateUserBackendBody = {
  nombre: string;
  correo: string;
  celular: string;
  billetera: string;
};

// Si tu backend devuelve el usuario creado, tipéalo aquí:
export type CreateUserResponse = {
  ok?: boolean;
  id?: string;
  // ...otros campos que devuelva tu API
};

export async function createUser(input: {
  name: string;
  email: string;
  phone: string;
  wallet: string;
}): Promise<CreateUserResponse> {
  const payload: CreateUserBackendBody = {
    nombre: input.name,
    correo: input.email,
    celular: input.phone,
    billetera: input.wallet,
  };
  return postJSON<CreateUserResponse>("/createUser", payload);
}

/** Crea billetera grupal: POST /createWallet con llaves en español */
export async function createGroupWallet(input: {
  name: string;
  description: string;
  members: string[]; // direcciones
}): Promise<{ id?: string; ok?: boolean }> {
  const payload = {
    miembros: input.members,
    nombre: input.name,
    descripcion: input.description,
  };
  return postJSON<{ id?: string; ok?: boolean }>("/createWallet", payload);
}


