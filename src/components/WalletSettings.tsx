/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Alert, AlertDescription } from "@/ui/alert";
import { Wallet, CreditCard, Plus, Edit, Trash2, Check, AlertCircle, Shield } from "lucide-react";

const walletAccounts = [
  {
    id: 1,
    type: "bank",
    name: "Chase Checking",
    accountNumber: "****4567",
    isDefault: true,
    verified: true,
    bank: "JPMorgan Chase",
    addedDate: "2023-12-15"
  },
  {
    id: 2,
    type: "bank",
    name: "Wells Fargo Savings",
    accountNumber: "****8901",
    isDefault: false,
    verified: true,
    bank: "Wells Fargo",
    addedDate: "2024-01-10"
  },
  {
    id: 3,
    type: "card",
    name: "Visa Debit Card",
    accountNumber: "****2345",
    isDefault: false,
    verified: false,
    bank: "Bank of America",
    addedDate: "2024-01-20"
  }
];

export function WalletSettings() {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [walletType, setWalletType] = useState("bank");

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "bank": return <Wallet className="h-4 w-4" />;
      case "card": return <CreditCard className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (wallet: any) => {
    if (wallet.isDefault) {
      return <Badge className="bg-orange-100 text-orange-800">Default</Badge>;
    }
    if (wallet.verified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">
            Manage your bank accounts and payment methods for fund transfers
          </p>
        </div>
        <Dialog open={showAddWallet} onOpenChange={setShowAddWallet}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Connect a new bank account or payment method to your investment platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method Type</Label>
                <Select value={walletType} onValueChange={setWalletType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="card">Debit/Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {walletType === "bank" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input id="bank-name" placeholder="JPMorgan Chase" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-name">Account Name</Label>
                      <Input id="account-name" placeholder="Main Checking" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="routing-number">Routing Number</Label>
                      <Input id="routing-number" placeholder="021000021" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input id="account-number" placeholder="123456789" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-type">Account Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {walletType === "card" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exp-month">Exp. Month</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exp-year">Exp. Year</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="YYYY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i} value={String(new Date().getFullYear() + i)}>
                              {new Date().getFullYear() + i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" maxLength={4} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardholder-name">Cardholder Name</Label>
                    <Input id="cardholder-name" placeholder="John Doe" />
                  </div>
                </>
              )}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your payment information is encrypted and securely stored. We use bank-level security to protect your financial data.
                </AlertDescription>
              </Alert>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddWallet(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddWallet(false)}>
                Add Payment Method
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {walletAccounts.map((wallet) => (
          <Card key={wallet.id} className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {getWalletIcon(wallet.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{wallet.name}</h4>
                      {getStatusBadge(wallet)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{wallet.bank}</span>
                      <span>•</span>
                      <span>{wallet.accountNumber}</span>
                      {wallet.verified && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-600" />
                            <span>Verified</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!wallet.isDefault && wallet.verified && (
                    <Button size="sm" variant="outline">
                      Set as Default
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Edit className="h-3 w-3" />
                  </Button>
                  {!wallet.isDefault && (
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              {!wallet.verified && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span>Verification required. We'll send small test deposits to verify this account.</span>
                  </div>
                  <Button size="sm" className="mt-2">
                    Verify Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Settings</CardTitle>
          <CardDescription>Configure how funds are transferred to and from your accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Funding Source</Label>
              <Select defaultValue="1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {walletAccounts.filter(w => w.verified).map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id.toString()}>
                      {wallet.name} ({wallet.accountNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Withdrawal Destination</Label>
              <Select defaultValue="1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {walletAccounts.filter(w => w.verified).map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id.toString()}>
                      {wallet.name} ({wallet.accountNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Transfer settings apply to automatic contributions and withdrawals. Individual transactions can override these defaults.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}