/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Progress } from "@/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Alert, AlertDescription } from "@/ui/alert";
import {
  Plus, Users, Eye, UserPlus, DollarSign, Clock, ThumbsUp, ThumbsDown, Vote as VoteIcon,
  ArrowUpRight, ArrowDownRight, Calendar
} from "lucide-react";

// ========== Tipos ==========
const currentUser = "Juan Pérez";

type Member = { name: string; initials: string; contribution: number };

type TransactionType = "contribution" | "withdrawal" | "dividend" | "fee";
type Transaction = {
  id: number;
  type: TransactionType;
  amount: number;   // positivo o negativo
  date: string;     // ISO o YYYY-MM-DD
  member: string;   // quién hizo la acción
  description: string;
};

type GroupStatus = "Activo" | "Pendiente" | "Inactivo";
type Group = {
  id: number;
  name: string;
  balance: number;
  goal: number;
  members: Member[];
  created: string;
  status: GroupStatus;
  description: string;
  transactions: Transaction[];
};

type VoteChoice = "yes" | "no";
type VoteRecord = { member: string; vote: VoteChoice; timestamp: string };

type BaseVote = {
  id: number;
  groupId: number;
  title: string;
  description: string;
  initiatedBy: string;
  dateInitiated: string; // ISO
  deadline: string;      // ISO o YYYY-MM-DD
  requiredVotes: number;
  votes: VoteRecord[];
};

type InviteVote = BaseVote & {
  type: "invite";
  details: { phoneNumber: string; message?: string };
};

type FundRequestVote = BaseVote & {
  type: "fund_request";
  details: { amount: number; purpose: string; notes?: string };
};

type ActiveVote = InviteVote | FundRequestVote;

// Nota: CompletedVote hereda de Invite/Fund => mantiene deadline/requiredVotes
type CompletedVote = (InviteVote | FundRequestVote) & {
  dateCompleted: string;
  result: "approved" | "rejected";
};

// ========== Datos mock ==========
const groupAccounts: Group[] = [
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
    status: "Activo",
    description: "Conservative growth portfolio for long-term stability",
    transactions: [
      { id: 1, type: "contribution", amount: 15000, date: "2024-01-15", member: "Juan Pérez", description: "Contribución mensual del grupo" },
      { id: 2, type: "dividend", amount: 8500, date: "2024-01-12", member: "Sistema", description: "Distribución de dividendos trimestral" },
      { id: 3, type: "withdrawal", amount: -25000, date: "2024-01-10", member: "Sarah Wilson", description: "Solicitud de fondos aprobada - gastos médicos" },
      { id: 4, type: "contribution", amount: 22000, date: "2024-01-08", member: "Mike Johnson", description: "Inversión adicional" },
    ],
  },
  {
    id: 2,
    name: "Beta Growth Fund",
    balance: 350000,
    goal: 750000,
    members: [
      { name: "John Doe", initials: "JD", contribution: 50 },
      { name: "Lisa Chen", initials: "LC", contribution: 30 },
      { name: "Tom Brown", initials: "TB", contribution: 20 },
    ],
    created: "2023-03-20",
    status: "Activo",
    description: "High-growth technology focused investment group",
    transactions: [
      { id: 1, type: "contribution", amount: 12000, date: "2024-01-14", member: "Lisa Chen", description: "Weekly contribution" },
      { id: 2, type: "fee", amount: -250, date: "2024-01-11", member: "System", description: "Management fee" },
      { id: 3, type: "contribution", amount: 18000, date: "2024-01-09", member: "John Doe", description: "Growth investment" },
    ],
  },
  {
    id: 3,
    name: "Retirement Planning Pool",
    balance: 890000,
    goal: 1200000,
    members: [
      { name: "John Doe", initials: "JD", contribution: 20 },
      { name: "Robert Davis", initials: "RD", contribution: 35 },
      { name: "Emma White", initials: "EW", contribution: 25 },
      { name: "James Wilson", initials: "JW", contribution: 20 },
    ],
    created: "2022-11-10",
    status: "Activo",
    description: "Long-term retirement focused conservative fund",
    transactions: [
      { id: 1, type: "contribution", amount: 35000, date: "2024-01-16", member: "Robert Davis", description: "Monthly retirement contribution" },
      { id: 2, type: "dividend", amount: 12000, date: "2024-01-13", member: "System", description: "Bond interest payout" },
      { id: 3, type: "contribution", amount: 18000, date: "2024-01-10", member: "Emma White", description: "Regular contribution" },
    ],
  },
];

const activeVotes: ActiveVote[] = [
  {
    id: 1,
    groupId: 1,
    type: "invite",
    title: "Invite Alex Johnson",
    description: "Invite Alex Johnson (+1 555-0123) to join Alpha Investment Group",
    initiatedBy: "John Doe",
    dateInitiated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h atrás
    deadline: "2024-01-22",
    requiredVotes: 2,
    votes: [
      { member: "John Doe", vote: "yes", timestamp: "2024-01-15T10:00:00Z" },
      { member: "Sarah Wilson", vote: "yes", timestamp: "2024-01-16T14:30:00Z" },
    ],
    details: { phoneNumber: "+1 555-0123", message: "Welcome to our investment group!" },
  },
  {
    id: 2,
    groupId: 1,
    type: "fund_request",
    title: "Emergency Medical Fund Request",
    description: "John Doe requests $25,000 for emergency medical expenses",
    initiatedBy: "John Doe",
    dateInitiated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8h atrás
    deadline: "2024-01-21",
    requiredVotes: 2,
    votes: [{ member: "Sarah Wilson", vote: "yes", timestamp: "2024-01-15T09:00:00Z" }],
    details: { amount: 25000, purpose: "Emergency medical expenses", notes: "Need funds for urgent medical procedure" },
  },
  {
    id: 3,
    groupId: 3,
    type: "fund_request",
    title: "Home Improvement Fund Request",
    description: "Robert Davis requests $15,000 for home improvement",
    initiatedBy: "Robert Davis",
    dateInitiated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
    deadline: "2024-01-17",
    requiredVotes: 3,
    votes: [
      { member: "John Doe", vote: "yes", timestamp: "2024-01-11T11:00:00Z" },
      { member: "Emma White", vote: "yes", timestamp: "2024-01-12T15:20:00Z" },
      { member: "James Wilson", vote: "yes", timestamp: "2024-01-13T08:45:00Z" },
    ],
    details: { amount: 15000, purpose: "Home improvement", notes: "Renovating kitchen and bathroom" },
  },
];

const completedVotes: CompletedVote[] = [
  {
    id: 4,
    groupId: 1,
    type: "fund_request",
    title: "Education Fund Request",
    description: "Sarah Wilson requested $30,000 for education expenses",
    initiatedBy: "Sarah Wilson",
    dateInitiated: "2024-01-08",
    deadline: "2024-01-09",
    requiredVotes: 2,
    dateCompleted: "2024-01-09",
    result: "rejected",
    votes: [
      { member: "John Doe", vote: "no", timestamp: "2024-01-08T16:00:00Z" },
      { member: "Mike Johnson", vote: "no", timestamp: "2024-01-09T10:30:00Z" },
    ],
    details: { amount: 30000, purpose: "Education expenses", notes: "Graduate school tuition" },
  },
];

// ========== Helpers ==========
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const clampPercent = (n: number) => Math.max(0, Math.min(100, n));

const getStatusColor = (status: GroupStatus) => {
  switch (status) {
    case "Activo": return "bg-green-100 text-green-800";
    case "Pendiente": return "bg-yellow-100 text-yellow-800";
    case "Inactivo": return "bg-gray-100 text-gray-800";
  }
};

const isMember = (group?: Group | null) =>
  !!group && group.members.some((m) => m.name === currentUser);

const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case "contribution": return <ArrowUpRight className="h-3 w-3 text-green-600" />;
    case "withdrawal": return <ArrowDownRight className="h-3 w-3 text-red-600" />;
    case "dividend": return <DollarSign className="h-3 w-3 text-blue-600" />;
    case "fee": return <ArrowDownRight className="h-3 w-3 text-orange-600" />;
  }
};
const getTransactionColor = (type: TransactionType) => {
  switch (type) {
    case "contribution": return "text-green-600";
    case "withdrawal": return "text-red-600";
    case "dividend": return "text-blue-600";
    case "fee": return "text-orange-600";
  }
};

const getVoteProgress = (vote: ActiveVote | CompletedVote) => {
  const yesVotes = vote.votes.filter((v) => v.vote === "yes").length;
  const noVotes = vote.votes.filter((v) => v.vote === "no").length;
  const totalVotes = vote.votes.length;
  return { yesVotes, noVotes, totalVotes, requiredVotes: vote.requiredVotes };
};

const hasUserVoted = (vote: ActiveVote) =>
  vote.votes.some((v) => v.member === currentUser);

const getUserVote = (vote: ActiveVote): VoteChoice | null =>
  vote.votes.find((v) => v.member === currentUser)?.vote ?? null;

const isVoteApproved = (vote: ActiveVote) => {
  const { yesVotes, requiredVotes } = getVoteProgress(vote);
  return yesVotes >= requiredVotes;
};

// Si aun votaran todos, ya no se llega al requerido
const isVoteRejected = (vote: ActiveVote) => {
  const group = groupAccounts.find((g) => g.id === vote.groupId);
  const totalMembers = group?.members.length ?? 0;
  const { yesVotes, totalVotes, requiredVotes } = getVoteProgress(vote);
  const remainingVotes = totalMembers - totalVotes;
  return yesVotes + remainingVotes < requiredVotes;
};

// 24h desde dateInitiated
const getTimeRemaining = (dateInitiated: string) => {
  const start = new Date(dateInitiated).getTime();
  const end = start + 24 * 60 * 60 * 1000;
  const now = Date.now();
  const remaining = end - now;
  if (remaining <= 0) return { hours: 0, minutes: 0, expired: true };
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, expired: false };
};

const getVotingProgress = (vote: ActiveVote | CompletedVote) => {
  const { yesVotes, requiredVotes } = getVoteProgress(vote);
  return Math.min((yesVotes / requiredVotes) * 100, 100);
};

// ========== Componente ==========
type ViewMode = "list" | "active-votes" | "group-details";

export function GroupAccountsView() {
  const [currentView, setCurrentView] = useState<ViewMode>("list");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedVote, setSelectedVote] = useState<ActiveVote | null>(null);
  const [requestPurpose, setRequestPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [, setTick] = useState(0); // para refrescar timers

  // refresco de timers cada minuto
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const handleViewGroup = (group: Group) => {
    setSelectedGroup(group);
    setCurrentView("group-details");
  };
  const handleShowVotes = () => setCurrentView("active-votes");
  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedGroup(null);
  };
  const resetRequestForm = () => {
    setRequestPurpose("");
    setCustomPurpose("");
  };

  // ====== Vistas ======
  const renderGroupsList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cuentas Grupales</h2>
          <p className="text-muted-foreground">Gestiona cuentas de inversión compartidas y colaboraciones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShowVotes}>
            <VoteIcon className="h-4 w-4 mr-2" />
            Votos Activos
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Cuenta Grupal</DialogTitle>
                <DialogDescription>Configura una nueva cuenta de inversión compartida</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Nombre del Grupo</Label>
                  <Input id="group-name" placeholder="Ingresa el nombre del grupo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" placeholder="Describe la estrategia y objetivos de inversión" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial-amount">Contribución Inicial</Label>
                  <Input id="initial-amount" type="number" placeholder="50000" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Crear Grupo</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de grupos */}
      <div className="grid gap-6">
        {groupAccounts.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {group.name}
                    <Badge className={getStatusColor(group.status)}>{group.status}</Badge>
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(group.balance)}</div>
                  <p className="text-sm text-muted-foreground">{group.members.length} miembros</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Miembros */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Miembros ({group.members.length})</Label>
                  </div>
                  <div className="space-y-2">
                    {group.members.map((member) => (
                      <div key={member.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback>{member.initials}</AvatarFallback></Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            {member.name === currentUser && <p className="text-xs text-muted-foreground">Tú</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{member.contribution}%</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency((group.balance * member.contribution) / 100)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Creado el {new Date(group.created).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewGroup(group)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Cuentas Grupales</CardTitle>
          <CardDescription>Vista general de todas las cuentas de inversión grupales</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Miembros</TableHead>
                <TableHead>Votos Activos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupAccounts.map((group) => {
                const groupVotes = activeVotes.filter((v) => v.groupId === group.id);
                return (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{formatCurrency(group.balance)}</TableCell>
                    <TableCell>
                      <div className="flex -space-x-1">
                        {group.members.slice(0, 3).map((m) => (
                          <Avatar key={m.name} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-xs">{m.initials}</AvatarFallback>
                          </Avatar>
                        ))}
                        {group.members.length > 3 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted border-2 border-background">
                            <span className="text-xs">+{group.members.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {groupVotes.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <VoteIcon className="h-3 w-3" />
                          <span className="text-sm">{groupVotes.length}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Ninguno</span>
                      )}
                    </TableCell>
                    <TableCell><Badge className={getStatusColor(group.status)}>{group.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(group.created).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleViewGroup(group)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveVotes = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleBackToList}>← Regresar</Button>
        <div>
          <h2 className="text-xl font-semibold">Votos Activos</h2>
          <p className="text-muted-foreground">Participa en decisiones grupales</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {activeVotes.map((vote) => {
              const group = groupAccounts.find((g) => g.id === vote.groupId);
              const { yesVotes, noVotes, requiredVotes } = getVoteProgress(vote);
              const userVoted = hasUserVoted(vote);
              const userVoteChoice = getUserVote(vote);
              const approved = isVoteApproved(vote);
              const rejected = isVoteRejected(vote);
              const timeRemaining = getTimeRemaining(vote.dateInitiated);
              const votingProgress = getVotingProgress(vote);

              return (
                <div key={vote.id} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{vote.title}</h4>
                        <Badge variant={vote.type === "invite" ? "secondary" : "outline"}>
                          {vote.type === "invite" ? "Invitación" : "Solicitud de Fondos"}
                        </Badge>
                        {approved && <Badge className="bg-green-100 text-green-800">Aprobado</Badge>}
                        {rejected && <Badge className="bg-red-100 text-red-800">Rechazado</Badge>}
                        {timeRemaining.expired && <Badge className="bg-orange-100 text-orange-800">Expirado</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{vote.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Grupo: {group?.name} • Iniciado por {vote.initiatedBy}
                      </p>
                      {"details" in vote && vote.type === "fund_request" && (
                        <p className="text-sm font-medium">{formatCurrency(vote.details.amount)}</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Clock className="h-3 w-3" />
                        {timeRemaining.expired ? (
                          <span className="text-orange-600 font-medium">Expirado</span>
                        ) : (
                          <span className="font-medium">
                            {timeRemaining.hours}h {timeRemaining.minutes}m restantes
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{yesVotes}/{requiredVotes} votos necesarios</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" /> {yesVotes}
                        <ThumbsDown className="h-3 w-3 ml-2" /> {noVotes}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progreso de votación</span>
                      <span className="font-medium">{votingProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={votingProgress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {userVoted && (
                        <Badge variant={userVoteChoice === "yes" ? "default" : "destructive"}>
                          Votaste {userVoteChoice === "yes" ? "Sí" : "No"}
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedVote(vote)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Detalles y Votar
                    </Button>
                  </div>
                </div>
              );
            })}
            {activeVotes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <VoteIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay votos activos</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGroupDetails = () => {
    if (!selectedGroup) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBackToList}>← Regresar</Button>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold">{selectedGroup.name}</h2>
            {isMember(selectedGroup) && <Badge variant="secondary">Miembro</Badge>}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardDescription>{selectedGroup.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Saldo Total</Label>
                <p className="text-3xl font-bold">{formatCurrency(selectedGroup.balance)}</p>
              </div>
              <div className="text-right">
                <Label>Estado</Label>
                <div className="mt-1">
                  <Badge className={getStatusColor(selectedGroup.status)}>{selectedGroup.status}</Badge>
                </div>
              </div>
            </div>
            <div>
              <Label className="mb-3 block">Votos Activos del Grupo</Label>
              <div className="space-y-3">
                {activeVotes
                  .filter((v) => v.groupId === selectedGroup.id)
                  .map((vote) => {
                    const { yesVotes, noVotes, requiredVotes } = getVoteProgress(vote);
                    const userVoted = hasUserVoted(vote);
                    const userVoteChoice = getUserVote(vote);
                    const approved = isVoteApproved(vote);
                    const rejected = isVoteRejected(vote);
                    const canVote = isMember(selectedGroup) && !userVoted && !approved && !rejected;
                    const timeRemaining = getTimeRemaining(vote.dateInitiated);
                    const votingProgress = getVotingProgress(vote);

                    return (
                      <div key={vote.id} className="border border-border rounded-lg p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{vote.title}</h4>
                              <Badge variant={vote.type === "invite" ? "secondary" : "outline"}>
                                {vote.type === "invite" ? "Invitación" : "Solicitud de Fondos"}
                              </Badge>
                              {approved && <Badge className="bg-green-100 text-green-800">Aprobado</Badge>}
                              {rejected && <Badge className="bg-red-100 text-red-800">Rechazado</Badge>}
                              {timeRemaining.expired && <Badge className="bg-orange-100 text-orange-800">Expirado</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{vote.description}</p>
                            <p className="text-xs text-muted-foreground">Iniciado por {vote.initiatedBy}</p>
                            {vote.type === "fund_request" && (
                              <p className="text-sm font-medium">{formatCurrency(vote.details.amount)}</p>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Clock className="h-3 w-3" />
                              {timeRemaining.expired ? (
                                <span className="text-orange-600 font-medium">Expirado</span>
                              ) : (
                                <span className="font-medium">
                                  {timeRemaining.hours}h {timeRemaining.minutes}m restantes
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium">{yesVotes}/{requiredVotes} votos</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ThumbsUp className="h-3 w-3" /> {yesVotes}
                              <ThumbsDown className="h-3 w-3 ml-2" /> {noVotes}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progreso de votación</span>
                            <span className="font-medium">{votingProgress.toFixed(0)}%</span>
                          </div>
                          <Progress value={votingProgress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {userVoted && (
                              <Badge variant={userVoteChoice === "yes" ? "default" : "destructive"}>
                                Votaste {userVoteChoice === "yes" ? "Sí" : "No"}
                              </Badge>
                            )}
                          </div>
                          {canVote && !timeRemaining.expired && (
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Votar Sí
                              </Button>
                              <Button size="sm" variant="destructive">
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                Votar No
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {activeVotes.filter((v) => v.groupId === selectedGroup.id).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <VoteIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay votos activos para este grupo</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-3 block text-base font-medium">Contribuciones de Miembros</Label>
              <div className="space-y-3">
                {selectedGroup.members.map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10"><AvatarFallback>{m.initials}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium">{m.name}</p>
                        {m.name === currentUser && <p className="text-xs text-muted-foreground">Tú</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{m.contribution}%</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency((selectedGroup.balance * m.contribution) / 100)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block text-base font-medium">Transacciones Recientes</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedGroup.transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(t.type)}
                      <div>
                        <p className="font-medium text-sm">{t.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(t.date).toLocaleDateString()} • {t.member}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(t.type)}`}>
                        {t.amount > 0 ? "+" : ""}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{t.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones rápidas (mock) */}
            {isMember(selectedGroup) && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Proponer Invitación
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Proponer Invitación de Miembro</DialogTitle>
                      <DialogDescription>
                        Inicia una votación para invitar a un nuevo miembro al grupo {selectedGroup.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Número de Teléfono</Label>
                        <Input id="phone" type="tel" placeholder="Ingresa el número de teléfono" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Miembro</Label>
                        <Input id="name" placeholder="Ingresa el nombre completo" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Mensaje (Opcional)</Label>
                        <Textarea id="message" placeholder="Añade un mensaje personal" rows={3} />
                      </div>
                      <Alert>
                        <VoteIcon className="h-4 w-4" />
                        <AlertDescription>
                          Esto creará una votación que requiere aprobación de la mayoría de los miembros.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancelar</Button>
                      <Button>Crear Votación</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Proponer Gasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Crear Solicitud de Fondos</DialogTitle>
                      <DialogDescription>
                        Crea una votación para solicitar fondos del grupo {selectedGroup.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Cantidad Solicitada</Label>
                        <Input id="amount" type="number" placeholder="Ingresa la cantidad" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purpose">Propósito</Label>
                        <Select value={requestPurpose} onValueChange={setRequestPurpose}>
                          <SelectTrigger><SelectValue placeholder="Selecciona el propósito" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergency">Emergencia</SelectItem>
                            <SelectItem value="medical">Gastos médicos</SelectItem>
                            <SelectItem value="education">Educación</SelectItem>
                            <SelectItem value="home">Mejoras del hogar</SelectItem>
                            <SelectItem value="investment">Oportunidad de inversión</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {requestPurpose === "other" && (
                        <div className="space-y-2">
                          <Label htmlFor="custom-purpose">Especificar Propósito</Label>
                          <Input
                            id="custom-purpose"
                            value={customPurpose}
                            onChange={(e) => setCustomPurpose(e.target.value)}
                            placeholder="Especifica el propósito"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notas Adicionales</Label>
                        <Textarea id="notes" placeholder="Proporciona detalles sobre tu solicitud" rows={3} />
                      </div>
                      <Alert>
                        <VoteIcon className="h-4 w-4" />
                        <AlertDescription>
                          Esto creará una votación que requiere aprobación de la mayoría (vigencia 24h).
                        </AlertDescription>
                      </Alert>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={resetRequestForm}>Cancelar</Button>
                      <Button>Crear Votación</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ========== Render principal ==========
  return (
    <div className="space-y-6">
      {currentView === "list" && renderGroupsList()}
      {currentView === "active-votes" && renderActiveVotes()}
      {currentView === "group-details" && renderGroupDetails()}

      {/* Modal detalle de voto */}
      {selectedVote && (
        <Dialog open={!!selectedVote} onOpenChange={() => setSelectedVote(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <VoteIcon className="h-5 w-5" />
                {selectedVote.title}
                <Badge variant={selectedVote.type === "invite" ? "secondary" : "outline"}>
                  {selectedVote.type === "invite" ? "Invitación de Miembro" : "Solicitud de Fondos"}
                </Badge>
              </DialogTitle>
              <DialogDescription>Detalles de la votación</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Iniciado por</Label>
                  <p className="font-medium">{selectedVote.initiatedBy}</p>
                </div>
                <div>
                  <Label>Fecha de Inicio</Label>
                  <p className="text-sm">{new Date(selectedVote.dateInitiated).toLocaleDateString("es-ES")}</p>
                </div>
              </div>

              {selectedVote.type === "fund_request" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cantidad Solicitada</Label>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(selectedVote.details.amount)}</p>
                  </div>
                  <div>
                    <Label>Propósito</Label>
                    <p className="font-medium">{selectedVote.details.purpose}</p>
                  </div>
                </div>
              )}
              {selectedVote.type === "invite" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Teléfono</Label>
                    <p className="font-medium">{selectedVote.details.phoneNumber}</p>
                  </div>
                  <div>
                    <Label>Mensaje</Label>
                    <p className="font-medium">{selectedVote.details.message || "Sin mensaje"}</p>
                  </div>
                </div>
              )}
              {"notes" in selectedVote.details && selectedVote.details.notes && (
                <div>
                  <Label>Notas</Label>
                  <div className="bg-muted rounded-md p-3">
                    <p className="text-sm">{selectedVote.details.notes}</p>
                  </div>
                </div>
              )}

              <div>
                <Label>Progreso de Votación</Label>
                <div className="mt-2 space-y-3">
                  {(() => {
                    const { yesVotes, noVotes, requiredVotes } = getVoteProgress(selectedVote);
                    const progress = getVotingProgress(selectedVote);
                    return (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span>Votos necesarios: {requiredVotes}</span>
                          <span>Votos a favor: {yesVotes}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Hacia aprobación</span>
                            <span className="font-medium">{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-3" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-green-100 text-green-800 p-2 rounded flex items-center justify-center">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            {yesVotes} Sí
                          </div>
                          <div className="bg-red-100 text-red-800 p-2 rounded flex items-center justify-center">
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            {noVotes} No
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {(() => {
                const group = groupAccounts.find((g) => g.id === selectedVote.groupId);
                const userVoted = hasUserVoted(selectedVote);
                const userVoteChoice = getUserVote(selectedVote);
                const approved = isVoteApproved(selectedVote);
                const rejected = isVoteRejected(selectedVote);
                const timeRemaining = getTimeRemaining(selectedVote.dateInitiated);
                const canVote = isMember(group) && !userVoted && !approved && !rejected && !timeRemaining.expired;

                return (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      {userVoted && (
                        <Badge variant={userVoteChoice === "yes" ? "default" : "destructive"}>
                          Tu voto: {userVoteChoice === "yes" ? "Sí" : "No"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setSelectedVote(null)}>Cerrar</Button>
                      {canVote && (
                        <>
                          <Button className="bg-green-600 hover:bg-green-700">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Votar Sí
                          </Button>
                          <Button variant="destructive">
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Votar No
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
