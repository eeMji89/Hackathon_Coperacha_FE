
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Alert, AlertDescription } from "@/ui/alert";

type Props = {
  name: string;
  setName: (v: string) => void;
  nameOk: boolean;

  email: string;
  setEmail: (v: string) => void;
  emailOk: boolean;

  phone: string;
  setPhone: (v: string) => void;
  phoneOk: boolean;

  onSave: (nombre: string, correo: string, celular: string) => Promise<void>;
  error?: string;
};

export default function InlineContactForm({
  name, setName, nameOk,
  email, setEmail, emailOk,
  phone, setPhone, phoneOk,
  onSave, error
}: Props) {
  const [saving, setSaving] = useState(false);

  const canSave = nameOk && emailOk && phoneOk && !saving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(name.trim(), email.trim(), phone.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Completa tus datos</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              placeholder="Tu nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {!nameOk && <p className="text-xs text-red-600">Requerido</p>}
          </div>

          <div className="space-y-2">
            <Label>Correo</Label>
            <Input
              type="email"
              placeholder="tucorreo@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!emailOk && <p className="text-xs text-red-600">Correo inválido</p>}
          </div>

          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              type="tel"
              placeholder="+1 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {!phoneOk && <p className="text-xs text-red-600">Teléfono inválido</p>}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={!canSave}>
            {saving ? "Guardando..." : "Guardar y continuar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


