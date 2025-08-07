
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Home,
  UserPlus,
  QrCode,
  CreditCard,
  LogOut,
  User,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function UserNav() {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage
              src="https://placehold.co/40x40.png"
              alt="Retailer"
              data-ai-hint="person portrait"
            />
            <AvatarFallback>RA</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Shop Owner</p>
            <p className="text-xs leading-none text-muted-foreground">
              owner@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => router.push("/onboarding")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/balance")}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Code Balance</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/")}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/customers/new", icon: UserPlus, label: "Add Customer" },
  { href: "/install", icon: QrCode, label: "Install Lock Module" },
  { href: "/balance", icon: CreditCard, label: "Code Balance" },
];

export function AppLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Sidebar>
          <SidebarHeader className="p-4">
             <div className="flex items-center gap-3">
                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l10-10A1 1 0 0 0 22 11l-10-9Z"/><path d="M7 7h.01"/></svg>
                </div>
                <h2 className="text-lg font-bold tracking-tight font-headline text-sidebar-foreground">
                    Retailer Assist
                </h2>
             </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: "right" }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenuButton tooltip={{ children: 'Profile', side: 'right' }} asChild>
              <Link href="/onboarding">
                <User />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
             <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="font-headline text-xl font-semibold md:text-2xl">
                    {title}
                </h1>
            </div>
            <UserNav />
          </header>
          <main className="p-4 sm:px-6 sm:py-0">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
