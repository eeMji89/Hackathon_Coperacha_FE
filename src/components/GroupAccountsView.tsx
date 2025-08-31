/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Alert, AlertDescription } from "@/ui/alert";
import { Progress } from "@/ui/progress";
import {
  Plus,
  Users,
  Eye,
  UserPlus,
  DollarSign,
  Clock,
  Check,
  Loader2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Vote as VoteIcon,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";

import {
  createWallet,
  getWallets,
  proponerMiembro,
  proponerGasto,
  votarPropuesta,
  getDashboard,
} from "@/lib/api";

import MemberWalletInputs from "@/components/MemberWalletInputs";
import { useWalletValidation } from "@/hooks/useWalletValidation";

import {
  useGroupsAndVotes,
  isAddressish,
  short,
} from "@/hooks/useGroupsAndVotes";
import type { Group, TransactionType, ActiveVote } from "@/lib/types";

// Usuario actual (mock por ahora)
const currentUser = "";

// Helpers locales (iconos/colores de transacciones)
const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Inactive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case "contribution":
      return <ArrowUpRight className="h-3 w-3 text-emerald-600" />;
    case "withdrawal":
      return <ArrowDownRight className="h-3 w-3 text-amber-600" />;
    case "dividend":
      return <DollarSign className="h-3 w-3 text-blue-600" />;
    case "fee":
      return <ArrowDownRight className="h-3 w-3 text-orange-600" />;
    default:
      return <DollarSign className="h-3 w-3" />;
  }
};
const getTransactionColor = (type: TransactionType) => {
  switch (type) {
    case "contribution":
      return "text-emerald-600";
    case "withdrawal":
      return "text-amber-700";
    case "dividend":
      return "text-blue-600";
    case "fee":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

export function GroupAccountsView() {
  const { address } = useAccount();

  const {
    groups,
    activeVotes,
    byGroupId,
    createGroup,
    createInviteVote,
    createFundRequestVote,
    castVote,
    hasUserVoted,
    getUserVote,
    isApproved,
    isRejected,
    requiredVotesFor,
    voteProgress,
    formatCurrency,
  } = useGroupsAndVotes();

  const [currentView, setCurrentView] = useState<
    "list" | "group-details" | "active-votes"
  >("list");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // dialogs controlados
  const [openCreate, setOpenCreate] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const [openFund, setOpenFund] = useState(false);

  // modal detalles de voto
  const [selectedVoteId, setSelectedVoteId] = useState<number | null>(null);

  // forms: crear grupo
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const walletVal = useWalletValidation([""]);

  // forms: invitar miembro
  const [inviteWallet, setInviteWallet] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");

  // forms: proponer gasto
  const [requestPurpose, setRequestPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [requestAmount, setRequestAmount] = useState<number | "">("");
  const [requestDesc, setRequestDesc] = useState("");
  const [requestTo, setRequestTo] = useState(""); // wallet destino

  const isMember = (group?: Group | null) =>
    !!group && group.members.some((m) => m.name === currentUser);

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedGroup(null);
  };
  // Ver detalles del grupo con datos reales
  const handleViewGroup = async (group: Group) => {
    setSelectedGroup(group);
    setCurrentView("group-details");

    const dashboard = await getDashboard(`${group.id}`);
    console.log("Dashboard:", dashboard);
  };

  const handleShowVotes = () => setCurrentView("active-votes");

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

  // Proponer invitación
  const onCreateInvite = async () => {
    if (!selectedGroup || !isAddressish(inviteWallet) || !address) return;

    await proponerMiembro({
      walletAddress: `${selectedGroup.id}`,
      nuevoMiembro: inviteWallet.trim(),
      descripcion: inviteMsg || "Invitación de miembro",
      miembro: address,
    });

    setInviteWallet("");
    setInviteMsg("");
    setOpenInvite(false);
  };

  // Proponer gasto
  const onCreateFundRequest = async () => {
    if (
      !selectedGroup ||
      requestAmount === "" ||
      !isAddressish(requestTo) ||
      !address
    )
      return;

    const purpose =
      requestPurpose === "other"
        ? customPurpose || "Otros"
        : requestPurpose || "General";

    await proponerGasto({
      walletAddress: `${selectedGroup.id}`,
      destinatario: requestTo.trim(),
      descripcion: requestDesc.trim(),
      miembro: address,
      monto: Number(requestAmount),
      unidad: "eth",
    });

    setRequestAmount("");
    setRequestPurpose("");
    setCustomPurpose("");
    setRequestDesc("");
    setRequestTo("");
    setOpenFund(false);
  };

  // Crear grupo
  const onCreateGroup = async () => {
    if (!groupName.trim() || !address) return;

    const validMembers = walletVal.values
      .map((w, i) => ({ w: w.trim(), s: walletVal.state[i] }))
      .filter((x) => x.w && x.s === "valid")
      .map((x) => x.w);

    const raw = [address, ...validMembers].filter(Boolean) as string[];
    const members = Array.from(
      new Map(raw.map((w) => [w.toLowerCase(), w])).values()
    );

    await createWallet({
      miembros: members,
      creador: address,
      nombre: groupName.trim(),
      descripcion: groupDesc.trim(),
    });

    setGroupName("");
    setGroupDesc("");
    walletVal.reset();
    setOpenCreate(false);

    // 🔄 refrescar
    const wallets = await getWallets();
    console.log("Wallets:", wallets.wallets);
  };

  // Votar
  const onCast = async (voteId: number, choice: "yes" | "no") => {
    if (!selectedGroup || !address) return;

    await votarPropuesta(`${selectedGroup.id}`, {
      idPropuesta: voteId,
      miembro: address,
    });
  };

  const selectedVote: ActiveVote | null = useMemo(
    () =>
      selectedVoteId
        ? activeVotes.find((v) => v.id === selectedVoteId) ?? null
        : null,
    [selectedVoteId, activeVotes]
  );

  const canVoteIn = (vote: ActiveVote | null) => {
    if (!vote) return false;
    const group = groups.find((g) => g.id === vote.groupId) || null;
    const time = getTimeRemaining(vote.dateInitiated);
    const userVoted = hasUserVoted(vote, currentUser);
    const isInitiator = vote.initiatedBy === currentUser;
    return (
      isMember(group) &&
      !userVoted &&
      !isInitiator &&
      !isApproved(vote) &&
      !isRejected(vote, group?.members.length ?? 0) &&
      !time.expired
    );
  };

  // —————————— VISTAS ——————————

  const renderGroupsList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cuentas Grupales</h2>
          <p className="text-muted-foreground">
            Gestiona cuentas compartidas y colaboraciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShowVotes}>
            <VoteIcon className="h-4 w-4 mr-2" />
            Votos Activos
          </Button>

          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Cuenta Grupal</DialogTitle>
                <DialogDescription>
                  Define nombre, descripción y wallets/ENS de miembros a
                  agregar. Tu wallet se añade automáticamente.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Nombre del Grupo</Label>
                  <Input
                    id="group-name"
                    placeholder="Ingresa el nombre del grupo"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-desc">Descripción</Label>
                  <Textarea
                    id="group-desc"
                    placeholder="Describe la estrategia y objetivos"
                    value={groupDesc}
                    onChange={(e) => setGroupDesc(e.target.value)}
                  />
                </div>
                <MemberWalletInputs
                  values={walletVal.values}
                  state={walletVal.state}
                  messages={walletVal.messages}
                  onChangeAt={walletVal.setAt}
                  onAdd={walletVal.add}
                  onRemoveAt={walletVal.removeAt}
                  onValidateAt={walletVal.validateOne}
                  onValidateAll={walletVal.validateAll}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenCreate(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={onCreateGroup}
                  disabled={!groupName.trim() || !walletVal.allValidated}
                >
                  Crear Grupo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* tarjetas de grupo */}
      <div className="grid gap-6">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {group.name}
                    <Badge className={getStatusColor(group.status)}>
                      {group.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold ">
                    {formatCurrency(group.balance)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.members.length} miembros
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Miembros ({group.members.length})</Label>
                  </div>
                  <div className="space-y-2">
                    {group.members.map((member) => (
                      <div
                        key={member.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{member.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            {member.name === currentUser && (
                              <p className="text-xs text-muted-foreground">
                                Tú
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {member.contribution}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(
                              (group.balance * member.contribution) / 100
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Creado el {new Date(group.created).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewGroup(group)}
                    >
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

      {/* resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Cuentas Grupales</CardTitle>
          <CardDescription>Vista general de todas las cuentas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Miembros</TableHead>
                <TableHead>Votos Activos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => {
                const av = byGroupId(group.id);
                return (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{formatCurrency(group.balance)}</TableCell>
                    <TableCell>{group.members.length}</TableCell>
                    <TableCell>
                      {av.length > 0 ? (
                        av.length
                      ) : (
                        <span className="text-muted-foreground">Ninguno</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(group.status)}>
                        {group.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(group.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewGroup(group)}
                      >
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
        <Button variant="outline" size="sm" onClick={handleBackToList}>
          ← Regresar
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Votos Activos</h2>
          <p className="text-muted-foreground">
            Invitaciones y solicitudes de fondos
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {activeVotes.map((vote) => {
              const group = groups.find((g) => g.id === vote.groupId);
              const userVoted = hasUserVoted(vote, currentUser);
              const userChoice = getUserVote(vote, currentUser);
              const approved = isApproved(vote);
              const rejected = isRejected(vote, group?.members.length ?? 0);
              const time = getTimeRemaining(vote.dateInitiated);
              const { yes, no } = voteProgress(vote);

              return (
                <div
                  key={vote.id}
                  className="border border-border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{vote.title}</h4>
                        <Badge
                          variant={
                            vote.type === "invite" ? "secondary" : "outline"
                          }
                        >
                          {vote.type === "invite"
                            ? "Invitación"
                            : "Solicitud de Fondos"}
                        </Badge>
                        {approved && (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            Aprobado
                          </Badge>
                        )}
                        {rejected && (
                          <Badge className="bg-amber-100 text-amber-800">
                            Rechazado
                          </Badge>
                        )}
                        {time.expired && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Expirado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vote.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Grupo: {group?.name} • Iniciado por {vote.initiatedBy}
                      </p>
                      {vote.type === "fund_request" && (
                        <p className="text-sm font-medium">
                          {formatCurrency((vote as any).details.amount)} •{" "}
                          {(vote as any).details.purpose}
                          {(vote as any).details?.to
                            ? ` → ${short((vote as any).details.to)}`
                            : ""}
                        </p>
                      )}
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Clock className="h-3 w-3" />
                        {time.expired ? (
                          <span className="text-orange-600 font-medium">
                            Expirado
                          </span>
                        ) : (
                          <span className="font-medium">
                            {time.hours}h {time.minutes}m
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" /> {yes}
                        <ThumbsDown className="h-3 w-3" /> {no}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {userVoted && (
                        <Badge
                          className={
                            userChoice === "yes"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          Tu voto: {userChoice === "yes" ? "Sí" : "No"}
                        </Badge>
                      )}
                      {!userVoted && vote.initiatedBy === currentUser && (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          Tu voto: Sí (iniciador)
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedVoteId(vote.id)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalles
                      </Button>
                    </div>
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
    const votes = byGroupId(selectedGroup.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBackToList}>
            ← Regresar
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold">{selectedGroup.name}</h2>
            {isMember(selectedGroup) && (
              <Badge variant="secondary">Miembro</Badge>
            )}
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
                <p className="text-3xl font-bold">
                  {formatCurrency(selectedGroup.balance)}
                </p>
              </div>
              <div className="text-right">
                <Label>Estado</Label>
                <div className="mt-1">
                  <Badge className={getStatusColor(selectedGroup.status)}>
                    {selectedGroup.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            {isMember(selectedGroup) && (
              <div className="grid grid-cols-2 gap-3">
                <Dialog open={openInvite} onOpenChange={setOpenInvite}>
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
                        Inicia una votación para invitar a un nuevo miembro al
                        grupo {selectedGroup.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Dirección de Billetera o ENS</Label>
                        <Input
                          placeholder="0x... o nombre.eth"
                          value={inviteWallet}
                          onChange={(e) =>
                            setInviteWallet(e.target.value.trim())
                          }
                        />
                        {!inviteWallet || isAddressish(inviteWallet) ? null : (
                          <p className="text-xs text-red-600">
                            Formato inválido
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Mensaje (opcional)</Label>
                        <Textarea
                          placeholder="Añade un mensaje personal"
                          value={inviteMsg}
                          onChange={(e) => setInviteMsg(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Alert>
                        <VoteIcon className="h-4 w-4" />
                        <AlertDescription>
                          Se creará una votación de 24h. Votos requeridos:{" "}
                          {requiredVotesFor(selectedGroup.members.length)}.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setInviteWallet("");
                          setInviteMsg("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={onCreateInvite}
                        disabled={!isAddressish(inviteWallet)}
                      >
                        Crear Votación
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={openFund} onOpenChange={setOpenFund}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Proponer Gasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Crear Solicitud de Fondos</DialogTitle>
                      <DialogDescription>
                        Crea una votación para solicitar fondos del grupo{" "}
                        {selectedGroup.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Cantidad Solicitada</Label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={requestAmount}
                          onChange={(e) =>
                            setRequestAmount(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Propósito</Label>
                        <Select
                          value={requestPurpose}
                          onValueChange={setRequestPurpose}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el propósito" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergency">
                              Emergencia
                            </SelectItem>
                            <SelectItem value="medical">
                              Gastos médicos
                            </SelectItem>
                            <SelectItem value="education">Educación</SelectItem>
                            <SelectItem value="home">
                              Mejoras del hogar
                            </SelectItem>
                            <SelectItem value="investment">
                              Oportunidad de inversión
                            </SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {requestPurpose === "other" && (
                        <div className="space-y-2">
                          <Label>Especifica el propósito</Label>
                          <Input
                            value={customPurpose}
                            onChange={(e) => setCustomPurpose(e.target.value)}
                            placeholder="Escribe el propósito"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          placeholder="Motivo del gasto a proponer"
                          value={requestDesc}
                          onChange={(e) => setRequestDesc(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Wallet destino</Label>
                        <Input
                          placeholder="0x... o nombre.eth"
                          value={requestTo}
                          onChange={(e) => setRequestTo(e.target.value.trim())}
                        />
                        {!requestTo || isAddressish(requestTo) ? null : (
                          <p className="text-xs text-red-600">
                            Dirección/ENS no válida
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRequestAmount("");
                          setRequestPurpose("");
                          setCustomPurpose("");
                          setRequestDesc("");
                          setRequestTo("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={onCreateFundRequest}
                        disabled={
                          requestAmount === "" ||
                          Number(requestAmount) <= 0 ||
                          !isAddressish(requestTo)
                        }
                      >
                        Crear Votación
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Votos activos del grupo */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Votos Activos del Grupo
              </Label>
              {votes.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No hay votos activos
                </div>
              )}
              {votes.map((vote) => {
                const userVoted = hasUserVoted(vote, currentUser);
                const userChoice = getUserVote(vote, currentUser);
                const approved = isApproved(vote);
                const rejected = isRejected(vote, selectedGroup.members.length);
                const time = getTimeRemaining(vote.dateInitiated);
                const { yes, no } = voteProgress(vote);

                return (
                  <div
                    key={vote.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{vote.title}</h4>
                          <Badge
                            variant={
                              vote.type === "invite" ? "secondary" : "outline"
                            }
                          >
                            {vote.type === "invite"
                              ? "Invitación"
                              : "Solicitud de Fondos"}
                          </Badge>
                          {approved && (
                            <Badge className="bg-emerald-100 text-emerald-800">
                              Aprobado
                            </Badge>
                          )}
                          {rejected && (
                            <Badge className="bg-amber-100 text-amber-800">
                              Rechazado
                            </Badge>
                          )}
                          {time.expired && (
                            <Badge className="bg-orange-100 text-orange-800">
                              Expirado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {vote.description}
                        </p>
                        {vote.type === "fund_request" && (
                          <p className="text-sm font-medium">
                            {formatCurrency((vote as any).details.amount)} •{" "}
                            {(vote as any).details.purpose}
                            {(vote as any).details?.to
                              ? ` → ${short((vote as any).details.to)}`
                              : ""}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Clock className="h-3 w-3" />
                          {time.expired ? (
                            <span className="text-orange-600 font-medium">
                              Expirado
                            </span>
                          ) : (
                            <span className="font-medium">
                              {time.hours}h {time.minutes}m
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" /> {yes}
                          <ThumbsDown className="h-3 w-3" /> {no}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {userVoted && (
                          <Badge
                            className={
                              userChoice === "yes"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }
                          >
                            Tu voto: {userChoice === "yes" ? "Sí" : "No"}
                          </Badge>
                        )}
                        {!userVoted && vote.initiatedBy === currentUser && (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            Tu voto: Sí (iniciador)
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedVoteId(vote.id)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Transacciones recientes */}
            <div>
              <Label className="mb-3 block text-base font-medium">
                Transacciones Recientes
              </Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedGroup.transactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between border border-border rounded-lg p-3"
                  >
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
                      <p
                        className={`font-semibold ${getTransactionColor(
                          t.type
                        )}`}
                      >
                        {t.amount > 0 ? "+" : ""}
                        {formatCurrency(t.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {t.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {currentView === "list" && renderGroupsList()}
      {currentView === "active-votes" && renderActiveVotes()}
      {currentView === "group-details" && renderGroupDetails()}

      {/* Modal de detalles (con barra de progreso y botones de voto) */}
      <Dialog
        open={!!selectedVoteId}
        onOpenChange={(o) => !o && setSelectedVoteId(null)}
      >
        <DialogContent className="sm:max-w-[640px]">
          {selectedVote ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <VoteIcon className="h-5 w-5" />
                  {selectedVote.title}
                  <Badge
                    variant={
                      selectedVote.type === "invite" ? "secondary" : "outline"
                    }
                  >
                    {selectedVote.type === "invite"
                      ? "Invitación de Miembro"
                      : "Solicitud de Fondos"}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Revisa el detalle y emite tu voto.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Grupo</Label>
                    <p className="font-medium">
                      {groups.find((g) => g.id === selectedVote.groupId)
                        ?.name ?? "—"}
                    </p>
                  </div>
                  <div>
                    <Label>Iniciado por</Label>
                    <p className="font-medium">{selectedVote.initiatedBy}</p>
                  </div>
                </div>

                <div>
                  <Label>Descripción</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedVote.description}
                  </p>
                </div>

                {selectedVote.type === "fund_request" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cantidad Solicitada</Label>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency((selectedVote as any).details.amount)}
                      </p>
                    </div>
                    <div>
                      <Label>Propósito</Label>
                      <p className="font-medium">
                        {(selectedVote as any).details.purpose}
                      </p>
                    </div>
                    {(selectedVote as any).details?.to && (
                      <div className="col-span-2">
                        <Label>Enviar a</Label>
                        <p className="font-medium">
                          {short((selectedVote as any).details.to)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedVote.type === "invite" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Billetera / ENS</Label>
                      <p className="font-medium">
                        {short((selectedVote as any).details.walletAddress)}
                      </p>
                    </div>
                    <div>
                      <Label>Mensaje</Label>
                      <p className="font-medium">
                        {(selectedVote as any).details.message || "—"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Estado / tiempo y progreso */}
                {(() => {
                  const { percent, yes, no, required } =
                    voteProgress(selectedVote);
                  const time = getTimeRemaining(selectedVote.dateInitiated);
                  const group = groups.find(
                    (g) => g.id === selectedVote.groupId
                  );
                  const approved = isApproved(selectedVote);
                  const rejected = isRejected(
                    selectedVote,
                    group?.members.length ?? 0
                  );

                  return (
                    <div className="space-y-3">
                      <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          {time.expired ? (
                            <span className="text-orange-600 font-medium">
                              Votación expirada
                            </span>
                          ) : (
                            <span className="font-medium">
                              {time.hours}h {time.minutes}m restantes
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {approved && (
                            <Badge className="bg-emerald-100 text-emerald-800">
                              Aprobado
                            </Badge>
                          )}
                          {rejected && (
                            <Badge className="bg-amber-100 text-amber-800">
                              Rechazado
                            </Badge>
                          )}
                          {!approved && !rejected && !time.expired && (
                            <Badge variant="outline">En Progreso</Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            Progreso hacia aprobación
                          </span>
                          <span className="font-medium">
                            {Math.round(percent)}%
                          </span>
                        </div>
                        <Progress value={percent} className="h-3" />
                        <div className="flex items-center justify-between text-xs mt-2">
                          <span>Requeridos: {required}</span>
                          <span>
                            Sí: {yes} • No: {no}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Acciones de voto */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {hasUserVoted(selectedVote, currentUser) && (
                      <Badge
                        className={
                          getUserVote(selectedVote, currentUser) === "yes"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      >
                        Tu voto:{" "}
                        {getUserVote(selectedVote, currentUser) === "yes"
                          ? "Sí"
                          : "No"}
                      </Badge>
                    )}
                    {!hasUserVoted(selectedVote, currentUser) &&
                      selectedVote.initiatedBy === currentUser && (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          Tu voto: Sí (iniciador)
                        </Badge>
                      )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedVoteId(null)}
                    >
                      Cerrar
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() =>
                        selectedVote && onCast(selectedVote.id, "yes")
                      }
                      disabled={!canVoteIn(selectedVote)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Votar Sí
                    </Button>
                    <Button
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() =>
                        selectedVote && onCast(selectedVote.id, "no")
                      }
                      disabled={!canVoteIn(selectedVote)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Votar No
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
