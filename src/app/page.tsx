import { LoginForm } from '@/components/auth/login-form';

export default function Home() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-primary h-12 w-12 mb-4"><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l10-10A1 1 0 0 0 22 11l-10-9Z"/><path d="M7 7h.01"/></svg>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Retailer EMI Assist
          </h1>
          <p className="mt-2 text-muted-foreground">
            The simplest way to manage your EMI customers.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          © 2024 Retailer EMI Assist. All rights reserved.
        </p>
      </div>
    </div>
  );
}
