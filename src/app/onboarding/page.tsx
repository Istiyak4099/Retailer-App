
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
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";

const formSchema = z.object({
  shop_owner_name: z.string().min(2, "Owner name is required"),
  mobile_number: z.string().regex(/^\d{11}$/, "Invalid 11-digit mobile number"),
  shop_name: z.string().min(2, "Shop name is required"),
  shop_address: z.string().min(10, "Shop address is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function OnboardingPage() {
  const { toast } = useToast();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isNewUser, setIsNewUser] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shop_owner_name: "",
      mobile_number: "",
      shop_name: "",
      shop_address: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          form.reset(userData);
          setIsNewUser(false);
        } else {
           form.reset({
            shop_owner_name: user.displayName || "",
            mobile_number: "",
            shop_name: "",
            shop_address: ""
          });
          setIsNewUser(true);
        }
      }
    };
    fetchUserData();
  }, [user, form]);


  async function onSubmit(values: FormData) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
        return;
    }

    try {
      await setDoc(doc(db, "Users", user.uid), {
        ...values,
        email_address: user.email,
        uid: user.uid,
      }, { merge: true });

      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });

      if (isNewUser) {
        router.push("/dashboard");
      }

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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <AppLayout title="User Profile">
      <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
        <CardHeader>
           <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 text-xl">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'}/>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{isNewUser ? "Welcome! Complete Your Profile" : "Edit Your Profile"}</CardTitle>
                <CardDescription>
                  {isNewUser ? "This information is needed to set up your retailer account." : "Keep your account details up to date."}
                </CardDescription>
              </div>
           </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="shop_owner_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Owner Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile_number"
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
               <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" value={user?.email || ""} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              <FormField
                control={form.control}
                name="shop_name"
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
                name="shop_address"
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
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isNewUser ? 'Save and Continue' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
