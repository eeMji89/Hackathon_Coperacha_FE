import { rest } from "./rest";

// ==== Usuarios ====
export const createUser = (data: {
  correo: string;
  nombre: string;
  celular: string;
  billetera: string;
}) => rest.post("/createUser", data);

export const getUsers = () => rest.get("/users");
export const getUserByEmail = (correo: string) =>
  rest.get(`/users/email/${correo}`);
export const getUserByPhone = (celular: string) =>
  rest.get(`/users/phone/${celular}`);
export const getUserByWallet = (billetera: string) =>
  rest.get(`/users/wallet/${billetera}`);

// ==== Wallet Comunitaria ====
export const createWallet = (payload: {
  miembros: string[];
  creador: string;
  nombre: string;
  descripcion: string;
}) => rest.post("/createWallet", payload);

export const getWallets = () => rest.get<{ wallets: string[] }>("/wallets");
export const getWalletUsers = (walletAddress: string) =>
  rest.get(`/wallets/${walletAddress}/users`);

// ==== Propuestas ====
export const proponerGasto = (payload: {
  walletAddress: string;
  destinatario: string;
  descripcion: string;
  miembro: string;
  monto: number;
  unidad: string;
}) => rest.post("/proponerGasto", payload);

export const proponerMiembro = (payload: {
  walletAddress: string;
  nuevoMiembro: string;
  descripcion: string;
  miembro: string;
}) => rest.post("/proponerMiembro", payload);

export const votarPropuesta = (
  walletAddress: string,
  payload: { idPropuesta: number; miembro: string }
) => rest.post(`/wallets/${walletAddress}/votar`, payload);

// ==== Validaciones ====
/**
 * Verifica si una wallet está registrada en el backend
 * usa GET /walletRegistrada?wallet=0x123...
 */
export const validateWallet = async (wallet: string): Promise<boolean> => {
  const res = await rest.get<{ registrada: boolean }>(
    `/walletRegistrada?wallet=${wallet}`
  );
  return res.registrada;
};

// ==== Saldos / Finanzas ====
export type SaldosResponse = {
  balanceWalletETH: string;        // ETH del usuario (decimal string)
  balanceWalletHNL: string | number;
  totalComunitarioETH: string;     // ETH comunitario (decimal string)
  totalComunitarioHNL: string | number;
};

export const getSaldos = (wallet: string) =>
  rest.get<SaldosResponse>(`/Saldos?wallet=${wallet}`);



export const getTxsPersonales = (address: string, limit = 6) =>
  rest.get(`/wallets/personal/${address}/txs?limit=${limit}`);

export const getAportes = (walletAddress: string) =>
  rest.get(`/wallets/${walletAddress}/aportes`);

export const getHistorialPropuestas = (walletAddress: string) =>
  rest.get(`/wallets/${walletAddress}/propuestas-historial`);

export const getDashboard = (walletAddress: string) =>
  rest.get<{
    walletAddress: string;
    saldo: number;
    miembros: { address: string; nombre?: string; aporte?: number }[];
    propuestas: any[];
    topAportes: any[];
    ultimasTx: any[];
  }>(`/wallets/${walletAddress}/dashboard`);

// ==== Configuración ====
export const getExchangeRate = () => rest.get(`/config/exchange-rate`);
export const setExchangeRate = (ethToHnl: number) =>
  rest.post(`/config/exchange-rate`, { ethToHnl });
