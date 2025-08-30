/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/components/generated/ui/button";
import { Input } from "@/components/generated/ui/input";
import { Label } from "@/components/generated/ui/label";
import { User, Phone, Wallet } from "lucide-react";

export function AccountSettings() {
  const [name, setName] = useState("Juan Pérez");
  const [phone, setPhone] = useState("+1 (555) 123-4567");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Configuración de Cuenta</h2>
        <p className="text-muted-foreground">Gestiona tu información personal y billetera</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>Actualiza tu nombre y número de teléfono</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Número de Teléfono</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Cancelar</Button>
            <Button>Guardar Cambios</Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Configuración de Billetera
          </CardTitle>
          <CardDescription>Gestiona tus métodos de pago y billeteras digitales</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">
            <Wallet className="h-4 w-4 mr-2" />
            Cambiar Billetera
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}