"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode, MinusCircle, PlusCircle, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const availableCodes = [
  '7aqtd566yud7p',
  'fgh3k9s8w2qaz',
  'p0oiu8y7t5rew',
  'mnb2v4c5x7z1q',
  'lkj7h5g4f6d3s'
];

export default function CodeBalancePage() {
  const [balance, setBalance] = useState(5);
  const { toast } = useToast();

  const handleScan = () => {
    if (balance <= 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Code Balance",
        description: "Please contact admin to recharge your account.",
      });
    } else {
      // This would trigger the camera for QR scanning in a real app.
      toast({
          title: "Scanner Ready",
          description: "QR code scanner would open now."
      })
      setBalance(prev => prev - 1);
    }
  };

  const handleAddBalance = () => {
      setBalance(prev => prev + 5);
      toast({
          title: "Balance Added",
          description: "Added 5 codes for demonstration."
      })
  }

  return (
    <AppLayout title="Code Balance">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 shadow-lg rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Codes</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{balance}</div>
                    <p className="text-xs text-muted-foreground">
                        {balance > 0 ? `-${(1 / balance * 100).toFixed(2)}% from last month's usage` : 'No codes available'}
                    </p>
                </CardContent>
            </Card>
            <Card className="col-span-3 shadow-lg rounded-xl">
                 <CardHeader className="pb-2">
                    <CardTitle>Actions</CardTitle>
                    <CardDescription>Use your balance or add more codes.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                     <Button className="w-full" onClick={handleScan} disabled={balance <= 0}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan QR & Activate
                    </Button>
                    <Button variant="secondary" onClick={handleAddBalance}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add
                    </Button>
                </CardContent>
            </Card>
        </div>
        <Card className="shadow-lg rounded-xl mt-4">
            <CardHeader>
                <CardTitle>Code List</CardTitle>
                <CardDescription>
                    A list of available activation codes. One code is used per activation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {balance > 0 ? (
                        <ul className="grid gap-3">
                            {availableCodes.slice(0, balance).map(code => (
                                <li key={code} className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-mono text-sm">{code}</span>
                                    <span className="text-xs text-green-500">Available</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>You have no available codes.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    </AppLayout>
  );
}
