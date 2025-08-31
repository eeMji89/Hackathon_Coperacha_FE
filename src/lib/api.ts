// src/lib/api.ts
import { getJSON, postJSON } from "@/lib/rest";

/** ==== Tipos de backend ==== */
export type BackendUser = {
  _id?: string;
  nombre: string;
  correo: string;
  celular: string;
  billetera: string;
};

/** ---- Validación de wallet (ya lo tenías) ---- */
export async function validateWallet(address: string): Promise<boolean> {
  try {
    const res = await getJSON<{ exists: boolean }>(
      `/wallets/validate?address=${encodeURIComponent(address)}`
    );
    return !!res?.exists;
  } catch {
    const hex42 = /^0x[a-fA-F0-9]{40}$/;
    const ens = /^[a-z0-9-]+\.eth$/i;
    return hex42.test(address) || ens.test(address);
  }
}

/** ---- Lecturas de usuario ---- */
export async function getUserByWallet(wallet: string): Promise<BackendUser | null> {
  try {
    return await getJSON<BackendUser>(`/users/wallet/${wallet}`);
  } catch {
    return null; // 404 u otro error => tratamos como no existe
  }
}

export async function getUserByEmail(correo: string): Promise<BackendUser | null> {
  try {
    return await getJSON<BackendUser>(`/users/email/${encodeURIComponent(correo)}`);
  } catch {
    return null;
  }
}

export async function getUserByPhone(celular: string): Promise<BackendUser | null> {
  try {
    return await getJSON<BackendUser>(`/users/phone/${encodeURIComponent(celular)}`);
  } catch {
    return null;
  }
}

/** ---- Crear usuario (ya lo tenías) ---- */
export type CreateUserBackendBody = {
  nombre: string;
  correo: string;
  celular: string;
  billetera: string;
};
export type CreateUserResponse = { ok?: boolean; id?: string };

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

/** ---- Crear billetera grupal (ya lo tenías) ---- */
export async function createGroupWallet(input: {
  name: string;
  description: string;
  members: string[];
}): Promise<{ id?: string; ok?: boolean }> {
  const payload = {
    miembros: input.members,
    nombre: input.name,
    descripcion: input.description,
  };
  return postJSON<{ id?: string; ok?: boolean }>("/createWallet", payload);
}



