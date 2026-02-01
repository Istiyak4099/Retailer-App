import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function InstallPage() {
  return (
    <AppLayout title="Install Lock Module">
      <div className="flex justify-center">
        <Card className="w-full max-w-md text-center shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Install the Lock Module APK</CardTitle>
            <CardDescription>
              Scan the QR code below with the target device to download and install the lock management application.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <Image
                src="/qr-code.png"
                alt="QR Code for Lock Module APK"
                width={256}
                height={256}
                data-ai-hint="qr code"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This QR code is permanent and can be used for all installations.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
