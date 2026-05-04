"use client";

import { AppLayout } from "@/components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Customer, EmiDetails } from "@/lib/types";
import {
  Lock,
  Unlock,
  Trash2,
  BellRing,
  MapPin,
  Phone,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CheckCircle,
  MessageSquare,
  Copy,
  Key,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, updateDoc, where, addDoc, serverTimestamp, increment, Timestamp } from "firebase/firestore";
import { format, addMonths, addWeeks } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { generateOfflineUnlockResponse } from "@/app/actions/offline-unlock";

const InfoRow = ({ label, value, action }: { label: string; value: string | number | undefined | null; action?: React.ReactNode }) => (
  <div className="flex justify-between items-center py-2 border-b last:border-0 min-h-[44px]">
    <dt className="text-muted-foreground">{label}</dt>
    <div className="flex items-center gap-3">
      <dd className="font-semibold text-right">{value !== undefined && value !== null ? value : 'N/A'}</dd>
      {action}
    </div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold mt-4 mb-2 text-primary border-l-4 border-primary pl-2">{children}</h3>
);

export default function CustomerDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { toast } = useToast();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [emiDetails, setEmiDetails] = useState<EmiDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [isLoggingPayment, setIsLoggingPayment] = useState(false);
  const [isOfflineLockOpen, setIsOfflineLockOpen] = useState(false);
  const [isOfflineUnlockOpen, setIsOfflineUnlockOpen] = useState(false);
  
  // Offline Unlock State
  const [challenge, setChallenge] = useState("");
  const [unlockResponse, setUnlockResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const customerDocRef = doc(db, "Customers", id);
        const customerDoc = await getDoc(customerDocRef);

        if (customerDoc.exists()) {
          const customerData = { id: customerDoc.id, ...customerDoc.data() } as Customer;
          setCustomer(customerData);

          const q = query(collection(db, "EmiDetails"), where("customerId", "==", id));
          const emiQuerySnapshot = await getDocs(q);
          if (!emiQuerySnapshot.empty) {
            const emiDoc = emiQuerySnapshot.docs[0];
            const emiData = emiDoc.data();
            
            const createdTime = emiData.created_time && emiData.created_time.toDate 
              ? emiData.created_time.toDate() 
              : new Date();

            setEmiDetails({ 
              id: emiDoc.id, 
              ...emiData,
              created_time: createdTime
            } as EmiDetails);
          }
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
         toast({ variant: "destructive", title: "Error", description: "Could not fetch customer data." });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerData();
  }, [id, toast]);
  
  const handleUpdateStatus = async (newStatus: Customer['status']) => {
    if (!customer) return;
    setIsUpdating(true);
    
    const customerDocRef = doc(db, "Customers", customer.id);
    const updateData = { status: newStatus };

    updateDoc(customerDocRef, updateData)
      .then(async () => {
        setCustomer(prev => prev ? { ...prev, status: newStatus } : null);
        
        let toastTitle = "Status Updated";
        let toastMessage = `Customer status changed to ${newStatus}.`;
        let Icon = CheckCircle2;
        let iconColor = "text-green-500";
        
        if (newStatus === 'locked') {
          toastTitle = "Device Locked";
          toastMessage = "Command executed successfully.";
          Icon = Lock;
          iconColor = "text-red-500";
        } else if (newStatus === 'active' && customer.status === 'locked') {
          toastTitle = "Device Unlocked";
          toastMessage = "Command executed successfully.";
          Icon = Unlock;
          iconColor = "text-green-500";
        }

        toast({
            title: (
              <div className="flex flex-col items-center gap-2">
                <Icon className={`h-10 w-10 ${iconColor}`} />
                <span>{toastTitle}</span>
              </div>
            ),
            description: toastMessage,
        });

        if (newStatus === "removed") {
            router.push('/customers/list?status=removed');
        }
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: customerDocRef.path,
          operation: 'update',
          requestResourceData: updateData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  const handleSendReminder = async () => {
    if (!customer) return;
    const targetAndroidId = emiDetails?.android_id || customer.android_id;
    if (!targetAndroidId) {
      toast({
        variant: "destructive",
        title: (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <span>Missing ID</span>
          </div>
        ),
        description: "Cannot send reminder without a valid Android ID.",
      });
      return;
    }

    setIsSendingReminder(true);
    const notificationData = {
      android_id: targetAndroidId,
      customerId: customer.id,
      type: 'payment_reminder',
      message: 'Please pay your pending EMI to avoid device lock.',
      status: 'pending',
      created_at: serverTimestamp(),
    };

    addDoc(collection(db, "Notifications"), notificationData)
      .then(() => {
        toast({
          title: (
            <div className="flex flex-col items-center gap-2">
              <BellRing className="h-10 w-10 text-blue-500" />
              <span>Reminder Sent</span>
            </div>
          ),
          description: `Command sent to device: ${targetAndroidId}`,
        });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'Notifications',
          operation: 'create',
          requestResourceData: notificationData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSendingReminder(false);
      });
  };

  const handleLogPayment = async () => {
    if (!emiDetails || !emiDetails.next_payment_date) return;
    
    const remainingCount = emiDetails.remaining_emi ?? emiDetails.number_of_emi;
    
    if (remainingCount <= 0) {
      toast({
        variant: "destructive",
        title: "No EMIs Left",
        description: "This customer has already completed all payments.",
      });
      return;
    }

    setIsLoggingPayment(true);
    const emiDocRef = doc(db, "EmiDetails", emiDetails.id);
    
    const currentNextDate = typeof emiDetails.next_payment_date.toDate === 'function' 
      ? emiDetails.next_payment_date.toDate() 
      : new Date(emiDetails.next_payment_date);

    let nextDate;
    if (emiDetails.emi_type === 'weekly') {
      nextDate = addWeeks(currentNextDate, 1);
    } else {
      nextDate = addMonths(currentNextDate, 1);
    }

    const updateData = {
      remaining_emi: increment(-1),
      next_payment_date: Timestamp.fromDate(nextDate),
    };

    updateDoc(emiDocRef, updateData)
      .then(() => {
        setEmiDetails(prev => {
          if (!prev) return null;
          const currentRemaining = prev.remaining_emi ?? prev.number_of_emi;
          return {
            ...prev,
            remaining_emi: currentRemaining - 1,
            next_payment_date: Timestamp.fromDate(nextDate)
          };
        });

        toast({
          title: (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <span>Payment Logged</span>
            </div>
          ),
          description: "EMI count decremented and next date advanced.",
        });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: emiDocRef.path,
          operation: 'update',
          requestResourceData: updateData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsLoggingPayment(false);
      });
  };

  const handleGenerateOfflineUnlock = async () => {
    const trimmed = challenge.trim().toUpperCase();
    if (trimmed.length < 6 || trimmed.length > 8) {
      toast({
        variant: "destructive",
        title: "Invalid Challenge",
        description: "Challenge must be between 6 and 8 characters.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateOfflineUnlockResponse(trimmed);
      setUnlockResponse(response);
    } catch (error) {
      console.error("Error generating offline unlock:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate response code.",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  if (loading) {
    return (
      <AppLayout title="Customer Details">
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  if (!customer) {
    return notFound();
  }
  
  const getStatusVariant = (
    status: Customer['status']
  ): "default" | "destructive" | "secondary" => {
    switch (status) {
      case "active":
      case "unlocked":
        return "default";
      case "locked":
        return "destructive";
      case "completed":
      case "pending":
      case "removed":
        return "secondary";
      default:
        return "default";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };
  
  const ActionButton = ({ status, title, description, buttonText, variant, icon: Icon, className }: { status: Customer['status'], title: string, description: string, buttonText: string, variant: Button['variant'], icon: React.ElementType, className?: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} className={className} disabled={isUpdating}>
          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
          {buttonText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleUpdateStatus(status)} className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : ''}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <AppLayout title="Customer Details">
      <div className="max-w-2xl mx-auto pb-10">
        <Card className="shadow-lg rounded-xl overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="bg-muted/30 p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 text-xl border-2 border-primary">
                <AvatarImage src={emiDetails?.live_photo || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {getInitials(customer.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl md:text-2xl">{customer.full_name}</CardTitle>
                    <Badge variant={getStatusVariant(customer.status)} className="ml-auto uppercase text-[10px]">
                      {customer.status}
                    </Badge>
                </div>
                <div className="flex items-center text-muted-foreground mt-1 text-sm">
                    <Phone className="h-3 w-3 mr-2 text-primary" />
                    <p>{customer.mobile_number}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6 space-y-4">
            <dl className="text-sm">
              <SectionTitle>Device Information</SectionTitle>
              <InfoRow label="Android ID" value={emiDetails?.android_id || customer.android_id} />

              <SectionTitle>Loan Information</SectionTitle>
              <InfoRow label="Product Name" value={emiDetails?.product_name} />
              <InfoRow label="Product Price" value={emiDetails?.price ? emiDetails.price.toLocaleString() : 'N/A'} />
              <InfoRow label="Processing Fee" value={emiDetails?.processing_fee ? emiDetails.processing_fee.toLocaleString() : 'N/A'} />
              <InfoRow label="Down Payment" value={emiDetails?.down_payment ? emiDetails.down_payment.toLocaleString() : 'N/A'} />
              <InfoRow label="Total EMI Amount" value={emiDetails?.total_emi ? emiDetails.total_emi.toLocaleString() : 'N/A'} />
              <InfoRow label="EMI Type" value={emiDetails?.emi_type ? emiDetails.emi_type.charAt(0).toUpperCase() + emiDetails.emi_type.slice(1) : 'N/A'} />
              <InfoRow label="EMI Installment" value={emiDetails?.emi_monthly_amount ? emiDetails.emi_monthly_amount.toLocaleString() : 'N/A'} />
              <InfoRow 
                label="Number of EMIs" 
                value={emiDetails?.number_of_emi} 
              />
              <InfoRow 
                label="Remaining EMI" 
                value={emiDetails?.remaining_emi ?? emiDetails?.number_of_emi} 
                action={
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 px-3 text-xs font-bold" 
                        disabled={isLoggingPayment || (emiDetails?.remaining_emi ?? emiDetails?.number_of_emi ?? 0) <= 0}
                      >
                        {isLoggingPayment ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                        Log Payment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Payment Logging</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to log a payment? This will decrement the remaining installments and advance the next due date.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogPayment}>
                          Confirm Payment
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                }
              />
              <InfoRow label="Date of Next Payment" value={emiDetails?.next_payment_date ? format(typeof emiDetails.next_payment_date.toDate === 'function' ? emiDetails.next_payment_date.toDate() : new Date(emiDetails.next_payment_date), 'PPP') : 'N/A'} />
              <InfoRow label="Activation Date" value={emiDetails?.created_time ? format(emiDetails.created_time, 'PP') : 'N/A'} />
              <InfoRow label="Loan ID" value={emiDetails?.id} />


              <SectionTitle>Personal Information</SectionTitle>
              <InfoRow label="Address" value={customer.address} />
              <InfoRow label="Mobile Number" value={customer.mobile_number} />
              <InfoRow label="Email" value={customer.email_address} />
            </dl>

            <Separator />
            
            {emiDetails && (emiDetails.nid_front || emiDetails.nid_back || emiDetails.live_photo) && (
              <>
                <SectionTitle>Uploaded Documents</SectionTitle>
                <div className="grid grid-cols-3 gap-2">
                    {emiDetails.nid_front && (
                      <div className="space-y-1 text-center">
                          <Image src={emiDetails.nid_front} alt="NID Front" width={150} height={100} className="rounded-md w-full object-cover h-24 border" data-ai-hint="document photo" />
                          <p className="text-[10px] text-muted-foreground">NID Front</p>
                      </div>
                    )}
                    {emiDetails.nid_back && (
                      <div className="space-y-1 text-center">
                          <Image src={emiDetails.nid_back} alt="NID Back" width={150} height={100} className="rounded-md w-full object-cover h-24 border" data-ai-hint="document photo" />
                          <p className="text-[10px] text-muted-foreground">NID Back</p>
                      </div>
                    )}
                    {emiDetails.live_photo && (
                      <div className="space-y-1 text-center">
                          <Image src={emiDetails.live_photo} alt="Live Photo" width={150} height={100} className="rounded-md w-full object-cover h-24 border" data-ai-hint="person selfie" />
                          <p className="text-[10px] text-muted-foreground">Live Photo</p>
                      </div>
                    )}
                </div>
              </>
            )}
            
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2 mt-6">
            <ActionButton
              status="locked"
              title="Confirm Device Lock"
              description="This will instantly lock the customer's device."
              buttonText="Lock"
              variant="destructive"
              icon={Lock}
              className="w-full h-12 text-base font-bold"
            />
             <ActionButton
              status="active"
              title="Confirm Device Unlock"
              description="This will instantly unlock the customer's device and set it to active status."
              buttonText="Unlock"
              variant="secondary"
              icon={Unlock}
              className="bg-green-600 hover:bg-green-700 text-white w-full h-12 text-base font-bold"
            />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base font-bold border-primary text-primary hover:bg-primary/10" 
                  disabled={isSendingReminder}
                >
                  {isSendingReminder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellRing className="mr-2 h-4 w-4" />}
                  Send Reminder
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Send Payment Reminder?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will send a notification command to the target device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSendReminder}>
                    Send
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Link href={`/customers/${id}/location`} passHref className="w-full">
              <Button variant="outline" className="w-full h-12 text-base font-bold border-blue-500 text-blue-500 hover:bg-blue-500/10">
                <MapPin className="mr-2 h-4 w-4" />Track
              </Button>
            </Link>

            <Dialog open={isOfflineLockOpen} onOpenChange={setIsOfflineLockOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base font-bold border-orange-500 text-orange-500 hover:bg-orange-500/10"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />Offline Lock
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Offline Lock Command</DialogTitle>
                  <DialogDescription>
                    Send this SMS manually to the customer's device to lock it without an internet connection.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Send SMS to:</p>
                    <p className="text-lg font-bold p-3 bg-muted rounded-md">{customer.mobile_number}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">SMS Command:</p>
                    <div className="relative">
                      <p className="text-xl font-mono font-bold p-4 bg-primary/10 text-primary border-2 border-primary/20 rounded-md break-all">
                        EMI-LOCK-S1dr4x@2026
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      navigator.clipboard.writeText("EMI-LOCK-S1dr4x@2026");
                      toast({
                        title: "Command Copied",
                        description: "The SMS command has been copied to your clipboard.",
                      });
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy Command
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isOfflineUnlockOpen} onOpenChange={setIsOfflineUnlockOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base font-bold border-green-600 text-green-600 hover:bg-green-600/10"
                >
                  <Key className="mr-2 h-4 w-4" />Offline Unlock Key
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Offline Unlock</DialogTitle>
                  <DialogDescription>
                    Enter the challenge code shown on the customer's lock screen.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Challenge Code:</p>
                    <Input
                      type="text"
                      placeholder="e.g. KP7N3XMT"
                      value={challenge}
                      onChange={(e) => setChallenge(e.target.value.toUpperCase())}
                      maxLength={8}
                      className="text-center text-2xl font-mono tracking-widest h-14"
                    />
                  </div>
                  
                  <Button 
                    className="w-full h-12 font-bold bg-green-600 hover:bg-green-700" 
                    onClick={handleGenerateOfflineUnlock}
                    disabled={isGenerating || challenge.trim().length < 6}
                  >
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                    Generate Response
                  </Button>

                  {unlockResponse && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg text-center border-2 border-green-200">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Tell this code to the customer</p>
                      <p className="text-4xl font-mono font-bold text-green-700 tracking-[0.2em] mt-2">
                        {unlockResponse}
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => {
                      setChallenge("");
                      setUnlockResponse(null);
                      setIsOfflineUnlockOpen(false);
                    }}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <ActionButton
              status="removed"
              title="Confirm Customer Removal"
              description="This will remove the customer and release the device from control. This cannot be undone."
              buttonText="Remove Device"
              variant="outline"
              icon={Trash2}
              className="w-full h-12 text-base font-bold col-span-2 mt-2"
            />
        </div>
      </div>
    </AppLayout>
  );
}
