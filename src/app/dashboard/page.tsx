"use client"

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  KeyRound,
  Smartphone,
  UserPlus,
  QrCode,
  Users,
  ChevronRight,
  UserCircle,
  Youtube,
  Share2,
  Headset,
} from "lucide-react";
import Link from 'next/link';

const StatCard = ({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: string | number }) => (
    <Card className="text-center shadow-md">
        <CardContent className="p-4">
            <Icon className="mx-auto h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
        </CardContent>
    </Card>
);

const ListItem = ({ icon: Icon, title, value, href }: { icon: React.ElementType, title: string, value?: string | number, href: string }) => (
    <Link href={href} passHref>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center">
                <Icon className="h-6 w-6 text-primary mr-4" />
                <div className="flex-grow">
                    <p className="font-semibold">{title}</p>
                    {value !== undefined && <p className="text-muted-foreground text-sm">{value}</p>}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
        </Card>
    </Link>
)


export default function DashboardPage() {
  return (
    <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={CalendarDays} title="Today's Activation" value={3} />
            <StatCard icon={KeyRound} title="Balance Key" value={0} />
            <StatCard icon={Smartphone} title="Active Devices" value={3} />
            <StatCard icon={CalendarDays} title="Pending" value={0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/customers/new" passHref>
                <Button className="w-full h-12 text-lg" size="lg">
                    <UserPlus className="mr-2 h-6 w-6" />
                    Add Customer
                </Button>
            </Link>
             <Link href="/install" passHref>
                <Button className="w-full h-12 text-lg" size="lg" variant="secondary">
                    <QrCode className="mr-2 h-6 w-6" />
                    Scan Device QR Code
                </Button>
            </Link>
        </div>

        <div className="space-y-2 pt-4">
            <ListItem icon={Users} title="Total Users" value="3" href="/customers" />
            <ListItem icon={KeyRound} title="Balance Keys" value="0" href="/balance" />
            <ListItem icon={UserCircle} title="User Profile" href="/onboarding" />
            <ListItem icon={Youtube} title="Installation Video" href="#" />
            <ListItem icon={Share2} title="Running Phone QR Code" href="#" />
            <ListItem icon={Headset} title="Contact Support" href="#" />
        </div>
    </div>
  );
}
