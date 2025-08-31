/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useRef, useState } from "react";
import type {
  Group,
  ActiveVote,
  InviteVote,
  FundRequestVote,
  VoteChoice,
} from "@/lib/types";

// ————————————————————————————————
// Utils
// ————————————————————————————————
export const short = (s: string, left = 6, right = 4) =>
  s?.length > left + right ? `${s.slice(0, left)}…${s.slice(-right)}` : s;

export const isAddressish = (val: string) =>
  /^0x[a-fA-F0-9]{40}$/.test(val) || /\.eth$/i.test(val);

// Simple id factory (solo mock local)
const useIdFactory = (start = 1) => {
  const ref = useRef(start);
  return () => (ref.current += 1);
};

// Helpers locales
const nowIso = () => new Date().toISOString();
const initialsFromName = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const initialsFromAddress = (addr: string) =>
  addr.startsWith("0x") ? addr.slice(2, 4).toUpperCase() : (addr[0] || "?").toUpperCase();

// ————————————————————————————————
// Mocks
// ————————————————————————————————
const initialGroups: Group[] = [
  {
    id: 1,
    name: "Alpha Investment Group",
    balance: 650000,
    goal: 1000000,
    members: [
      { name: "Juan Pérez", initials: "JP", contribution: 45 },
      { name: "Sarah Wilson", initials: "SW", contribution: 30 },
      { name: "Mike Johnson", initials: "MJ", contribution: 25 },
    ],
    created: "2023-01-15",
    status: "Active",
    description: "Conservative growth portfolio for long-term stability",
    transactions: [
      { id: 1, type: "contribution", amount: 15000, date: "2024-01-15", member: "Juan Pérez", description: "Contribución mensual del grupo" },
      { id: 2, type: "dividend",    amount:  8500, date: "2024-01-12", member: "Sistema",    description: "Distribución de dividendos trimestral" },
      { id: 3, type: "withdrawal",  amount: -25000, date: "2024-01-10", member: "Sarah Wilson", description: "Solicitud aprobada - gastos médicos" },
    ],
  },
];

const initialActiveVotes: ActiveVote[] = [
  {
    id: 1,
    groupId: 1,
    type: "invite",
    title: "Invite Alex Johnson",
    description: "Invitar a 0x1234…abcd al grupo Alpha",
    initiatedBy: "John Doe",
    dateInitiated: nowIso(),
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    requiredVotes: 2,
    votes: [{ member: "John Doe", vote: "yes", timestamp: nowIso() }], // iniciador = YES
    details: { walletAddress: "0x1234567890abcdef1234567890abcdef1234abcd", message: "Welcome!" },
  },
];

// ————————————————————————————————
// Hook
// ————————————————————————————————
export function useGroupsAndVotes() {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [activeVotes, setActiveVotes] = useState<ActiveVote[]>(initialActiveVotes);
  const nextVoteId = useIdFactory(initialActiveVotes.at(-1)?.id ?? 1);
  const nextGroupId = useIdFactory(initialGroups.at(-1)?.id ?? 1);

  const byGroupId = (groupId: number) => activeVotes.filter((v) => v.groupId === groupId);

  const requiredVotesFor = (memberCount: number) =>
    Math.max(1, Math.ceil(memberCount / 2));

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const voteProgress = (vote: ActiveVote) => {
    const yes = vote.votes.filter((v) => v.vote === "yes").length;
    const no = vote.votes.filter((v) => v.vote === "no").length;
    const percent = Math.min(100, (yes / vote.requiredVotes) * 100);
    return { yes, no, required: vote.requiredVotes, percent };
  };

  const hasUserVoted = (vote: ActiveVote, member: string) =>
    !!vote.votes.find((v) => v.member === member);

  const getUserVote = (vote: ActiveVote, member: string): VoteChoice | null =>
    vote.votes.find((v) => v.member === member)?.vote ?? null;

  const isApproved = (vote: ActiveVote) =>
    vote.votes.filter((v) => v.vote === "yes").length >= vote.requiredVotes;

  const isRejected = (vote: ActiveVote, totalMembers: number) => {
    const yes = vote.votes.filter((v) => v.vote === "yes").length;
    const cast = vote.votes.length;
    const remaining = totalMembers - cast;
    return yes + remaining < vote.requiredVotes;
  };

  // ——— Crear Grupo 
  const createGroup = async (args: {
    name: string;
    description: string;
    creatorName: string;          
    creatorAddress?: string;      
    memberWallets: string[];    
  }) => {
    const uniqueWallets = Array.from(
      new Set(args.memberWallets.map((w) => w.trim()).filter(Boolean))
    );

    const members: Group["members"] = [
      // creador: mantener nombre legible (para que isMember funcione por nombre)
      { name: args.creatorName, initials: initialsFromName(args.creatorName), contribution: 0 },
      // invitados: usar la dirección/ENS “short” como nombre por ahora (se puede mapear a perfiles luego)
      ...uniqueWallets.map((w) => ({
        name: short(w),
        initials: initialsFromAddress(w),
        contribution: 0,
      })),
    ];

    const newGroup: Group = {
      id: nextGroupId(),
      name: args.name,
      description: args.description,
      balance: 0,
      goal: 0,
      status: "Active",
      created: new Date().toISOString(),
      members,
      transactions: [],
    };

    setGroups((prev) => [newGroup, ...prev]);
    return newGroup;
  };

  // ——— Crear VOTACIÓN: INVITE (iniciador YES automático)
  const createInviteVote = async (args: {
    groupId: number;
    walletAddress: string;
    message?: string;
    initiatedBy: string;
  }) => {
    const group = groups.find((g) => g.id === args.groupId);
    const required = requiredVotesFor(group?.members.length ?? 0);
    const now = nowIso();

    const newVote: InviteVote = {
      id: nextVoteId(),
      groupId: args.groupId,
      type: "invite",
      title: `Invitar ${short(args.walletAddress)}`,
      description: `Propuesta para invitar a ${args.walletAddress}`,
      initiatedBy: args.initiatedBy,
      dateInitiated: now,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      requiredVotes: required,
      votes: [{ member: args.initiatedBy, vote: "yes", timestamp: now }], // ✅ iniciador = YES
      details: { walletAddress: args.walletAddress, message: args.message },
    };

    setActiveVotes((prev) => [newVote, ...prev]);
    return newVote;
  };

  // ——— Crear VOTACIÓN: FUND REQUEST (agrega to)
  const createFundRequestVote = async (args: {
    groupId: number;
    amount: number;
    purpose: string;
    description: string;
    to: string;               // wallet destino
    notes?: string;
    initiatedBy: string;
  }) => {
    const group = groups.find((g) => g.id === args.groupId);
    const required = requiredVotesFor(group?.members.length ?? 0);
    const now = nowIso();

    const newVote: FundRequestVote = {
      id: nextVoteId(),
      groupId: args.groupId,
      type: "fund_request",
      title: `Propuesta de Gasto: ${formatCurrency(args.amount)}`,
      description: args.description,
      initiatedBy: args.initiatedBy,
      dateInitiated: now,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      requiredVotes: required,
      votes: [{ member: args.initiatedBy, vote: "yes", timestamp: now }], // ✅ iniciador = YES
      // @ts-expect-error: ampliamos el shape con "to" en details (compatible cuando conectes backend/contrato)
      details: { amount: args.amount, purpose: args.purpose, to: args.to, notes: args.notes },
    };

    setActiveVotes((prev) => [newVote, ...prev]);
    return newVote;
  };

  const castVote = async (voteId: number, member: string, choice: VoteChoice) => {
    setActiveVotes((prev) =>
      prev.map((v) => {
        if (v.id !== voteId) return v;
        if (v.votes.some((x) => x.member === member)) return v; // ya votó
        if (v.initiatedBy === member) return v;                 // iniciador ya cuenta como YES
        return { ...v, votes: [...v.votes, { member, vote: choice, timestamp: nowIso() }] };
      })
    );
  };

  return {
    groups,
    activeVotes,
    byGroupId,
    requiredVotesFor,
    voteProgress,
    hasUserVoted,
    getUserVote,
    isApproved,
    isRejected,
    createGroup,
    createInviteVote,
    createFundRequestVote,
    castVote,
    formatCurrency,
  };
}
