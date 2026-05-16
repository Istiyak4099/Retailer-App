"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Building, Loader2, Mail, MapPin, Phone, User as UserIcon, CreditCard, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { SessionData } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  mobileNumber: z.string().regex(/^\d{11}$/, "Invalid 11-digit mobile number"),
  shopName: z.string().min(2, "Shop name is required"),
  address: z.string().min(10, "Address is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined | null }) => (
    <div className="flex items-start py-3">
        <Icon className="h-5 w-5 text-primary mr-4 mt-1" />
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-semibold break-all">{value || 'N/A'}</p>
        </div>
    </div>
);

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<SessionData | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mobileNumber: "",
      shopName: "",
      address: "",
      email: "",
    },
  });

  useEffect(() => {
    const fetchSessionAndUser = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);

          const userDocRef = doc(db, "Retailers", sessionData.userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const fetchedData = userDoc.data();
            setUserData(fetchedData);
            form.reset({
              name: fetchedData.name || sessionData.name || "",
              mobileNumber: fetchedData.mobileNumber || sessionData.mobileNumber || "",
              shopName: fetchedData.shopName || sessionData.shopName || "",
              address: fetchedData.address || "",
              email: fetchedData.email || "",
            });
            setIsNewUser(false);
          } else {
            form.reset({
              name: sessionData.name || "",
              mobileNumber: sessionData.mobileNumber || "",
              shopName: sessionData.shopName || "",
              address: "",
              email: "",
            });
            setIsNewUser(true);
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessionAndUser();
  }, [form, router]);

  async function onSubmit(values: FormData) {
    if (!session) return;
    try {
      const userPayload = {
        ...values,
        key_balance: isNewUser ? 10 : userData?.key_balance || 0,
      };

      await setDoc(doc(db, "Retailers", session.userId), userPayload, { merge: true });
      
      const updatedUserData = await getDoc(doc(db, "Retailers", session.userId));
      setUserData(updatedUserData.data());
      setIsNewUser(false);

      toast({
        title: "Profile Saved",
        description: "Your information has been updated successfully.",
      });

    } catch (error) {
      console.error("Error saving profile: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save your profile. Please try again.",
      });
    }
  }
  
  if (loading) {
    return (
      <AppLayout title="Loading Profile...">
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (isNewUser) {
    return (
        <AppLayout title="Retailer Onboarding">
        <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
            <CardHeader>
            <CardTitle>Welcome! Complete Your Profile</CardTitle>
            <CardDescription>
                This information is needed to set up your retailer account.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                            <Input placeholder="11-digit mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="shopName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Shop Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g. The Gadget Store" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Shop Address</FormLabel>
                        <FormControl>
                        <Input placeholder="Full shop address" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                        <Input placeholder="retailer@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save and Continue
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
        </AppLayout>
    );
  }

  return (
    <AppLayout title="User Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-lg rounded-xl">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={undefined} alt="User Profile" />
                    <AvatarFallback>
                        <UserIcon className="h-8 w-8" />
                    </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl text-primary mb-0">Personal Information</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <Separator className="mb-4" />
                <InfoRow icon={UserIcon} label="Name" value={userData?.name} />
                <Separator />
                <InfoRow icon={Phone} label="Mobile Number" value={userData?.mobileNumber} />
                <Separator />
                <InfoRow icon={Mail} label="Email Address" value={userData?.email} />
            </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl">
            <CardHeader className="flex flex-row items-center gap-4">
                <Building className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl text-primary mb-0">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                 <Separator className="mb-4" />
                <InfoRow icon={Hash} label="Retailer Id" value={session?.userId} />
                <Separator />
                <InfoRow icon={Building} label="Shop Name" value={userData?.shopName} />
                <Separator />
                <InfoRow icon={MapPin} label="Address" value={userData?.address} />
                <Separator />
                <InfoRow icon={CreditCard} label="Code Balance" value={userData?.key_balance} />
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
