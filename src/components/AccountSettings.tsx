
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { User, Phone, Mail } from "lucide-react";

export function AccountSettings() {
  const { profile, loading, error } = useUserProfile();

  const Row = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
  }) => (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{value && value.trim() ? value : "—"}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Configuración de Cuenta</h2>
        <p className="text-muted-foreground">Revisa tu información personal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
          {error && <p className="text-sm text-red-600">Error: {error}</p>}

          {!loading && !error && (
            <>
              <Row icon={<User className="h-4 w-4" />} label="Nombre completo" value={profile.name} />
              <Row icon={<Mail className="h-4 w-4" />} label="Correo" value={profile.email} />
              <Row icon={<Phone className="h-4 w-4" />} label="Teléfono" value={profile.phone} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
