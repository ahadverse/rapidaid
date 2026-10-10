import type { Metadata } from 'next';
import Link from 'next/link';
import { DemoLogin } from '@/components/auth/demo-login';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldSeparator } from '@/components/ui/field';

const description = 'Sign in to request, track or dispatch ambulances.';

export const metadata: Metadata = {
  title: 'Login',
  description,
  openGraph: { title: 'Login | RapidAid', description, url: '/login' },
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back 👋</CardTitle>
        <CardDescription>Login to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border bg-muted/30 p-4 sm:p-5">
          <LoginForm />
        </div>
        <FieldSeparator>OR</FieldSeparator>
        <DemoLogin />
        <p className="text-center text-sm text-muted-foreground">
          New to RapidAid?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
