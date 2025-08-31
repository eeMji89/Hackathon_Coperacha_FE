import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Users, PieChart as PieChartIcon, Activity, Target } from "lucide-react";


export function AccountOverview() {
  return (
    <div className="space-y-9">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">$2,847,392</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span> desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fondos Individuales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">$1,847,392</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </span> crecimiento del portafolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas Grupales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,000,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-red-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2.1%
              </span> este mes
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas transacciones y actualizaciones de cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: "deposit", account: "Fondo Crecimiento Tech", amount: "+$50,000", time: "hace 2 horas", status: "completado" },
              { type: "withdrawal", account: "Cuenta Grupal Alpha", amount: "-$25,000", time: "hace 5 horas", status: "completado" },
              { type: "transfer", account: "Fondo Conservador", amount: "+$10,000", time: "hace 1 día", status: "completado" },
              { type: "deposit", account: "Cuenta Grupal Beta", amount: "+$75,000", time: "hace 2 días", status: "pendiente" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.type === 'deposit' ? 'bg-green-100 text-green-600' :
                    activity.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'deposit' ? '↓' : 
                     activity.type === 'withdrawal' ? '↑' : '↔'}
                  </div>
                  <div>
                    <p className="font-medium">{activity.account}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    activity.amount.startsWith('+') ? 'text-green-600' : 
                    activity.amount.startsWith('-') ? 'text-red-600' : 
                    'text-foreground'
                  }`}>
                    {activity.amount}
                  </p>
                  <Badge variant={activity.status === 'completado' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}