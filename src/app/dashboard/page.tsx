
"use client"

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  KeyRound,
  UserPlus,
  QrCode,
  Users,
  ChevronRight,
  UserCircle,
  Youtube,
  Share2,
  Headset,
  Hourglass,
  Lock,
  Unlock,
  Trash2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";

const StatCard = ({ icon: Icon, title, value, iconColor, href, loading }: { icon: React.ElementType, title: string, value: string | number, iconColor?: string, href: string, loading?: boolean }) => (
    <Link href={href} passHref>
      <Card className="text-center shadow-md flex-shrink-0 w-[140px] h-full hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <Icon className={cn("mx-auto h-8 w-8 text-primary mb-2", iconColor)} />
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <p className="text-2xl font-bold">{value}</p>}
              <p className="text-xs text-muted-foreground">{title}</p>
          </CardContent>
      </Card>
    </Link>
);

const ListItem = ({ icon: Icon, title, value, href, loading }: { icon: React.ElementType, title: string, value?: string | number, href: string, loading?: boolean }) => (
    <Link href={href} passHref>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center">
                <Icon className="h-6 w-6 text-primary mr-4" />
                <div className="flex-grow">
                    <p className="font-semibold">{title}</p>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : value !== undefined && <p className="text-muted-foreground text-sm">{value}</p>}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
        </Card>
    </Link>
)


export default function DashboardPage() {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState({
    today: 0,
    active: 0,
    balance: 0,
    pending: 0,
    locked: 0,
    unlocked: 0,
    removed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const customerQuery = collection(db, 'Customers');
        const userCustomersQuery = query(customerQuery, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(userCustomersQuery);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const emiQuery = query(
          collection(db, "EmiDetails"),
          where("created_time", ">=", Timestamp.fromDate(today)),
          where("created_time", "<", Timestamp.fromDate(tomorrow))
        );
        const emiSnapshot = await getDocs(emiQuery);
        const todaysActivations = new Set(emiSnapshot.docs.map(doc => doc.data().customerId));
        
        let active = 0, pending = 0, locked = 0, unlocked = 0, removed = 0, total = 0;

        querySnapshot.forEach((doc) => {
            const customer = doc.data();
            total++;
            switch(customer.status) {
                case 'Active': active++; break;
                case 'Pending': pending++; break;
                case 'Locked': locked++; break;
                case 'Unlocked': unlocked++; break;
                case 'Removed': removed++; break;
            }
        });

        // Filter today's activations for the current user
        const customerIds = querySnapshot.docs.map(doc => doc.id);
        const userTodaysActivations = [...todaysActivations].filter(id => customerIds.includes(id)).length;

        // Fetch balance from user profile
        // This is a placeholder, as the user profile logic needs to be fully implemented
        const balance = 0; 
        
        setStats({ today: userTodaysActivations, active, balance, pending, locked, unlocked, removed, total });

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-4">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            <CarouselItem className="basis-auto">
               <StatCard icon={CheckCircle} title="Today's Activation" value={stats.today} iconColor="text-blue-500" href="/customers/list?status=today" loading={loading} />
            </CarouselItem>
             <CarouselItem className="basis-auto">
               <StatCard icon={Users} title="Active Devices" value={stats.active} href="/customers/list?status=Active" loading={loading} />
            </CarouselItem>
            <CarouselItem className="basis-auto">
               <StatCard icon={KeyRound} title="Balance Keys" value={stats.balance} href="/balance" loading={loading} />
            </CarouselItem>
            <CarouselItem className="basis-auto">
              <StatCard icon={Hourglass} title="Pending Devices" value={stats.pending} iconColor="text-orange-500" href="/customers/list?status=Pending" loading={loading} />
            </CarouselItem>
            <CarouselItem className="basis-auto">
              <StatCard icon={Lock} title="Locked Devices" value={stats.locked} iconColor="text-red-500" href="/customers/list?status=Locked" loading={loading} />
            </CarouselItem>
            <CarouselItem className="basis-auto">
              <StatCard icon={Unlock} title="Unlocked Devices" value={stats.unlocked} iconColor="text-green-500" href="/customers/list?status=Unlocked" loading={loading} />
            </CarouselItem>
            <CarouselItem className="basis-auto">
               <StatCard icon={Trash2} title="Removed Devices" value={stats.removed} href="/customers/list?status=Removed" loading={loading} />
            </CarouselItem>
          </CarouselContent>
        </Carousel>

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
            <ListItem icon={Users} title="Total Customers" value={stats.total} href="/customers" loading={loading} />
            <ListItem icon={KeyRound} title="Balance Keys" value={stats.balance} href="/balance" loading={loading} />
            <ListItem icon={UserCircle} title="User Profile" href="/onboarding" />
            <ListItem icon={Youtube} title="Installation Video" href="#" />
            <ListItem icon={Share2} title="Running Phone QR Code" href="#" />
            <ListItem icon={Headset} title="Contact Support" href="#" />
        </div>
    </div>
  );
}
