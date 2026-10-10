import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ContactForm } from '@/components/contact/contact-form';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const title = 'Contact';
const description =
  'Questions about dispatch, partnerships or joining as a driver? Send us a message.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title: `${title} | RapidAid`, description, url: '/contact' },
};

const details: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: Phone, label: 'Phone', value: '+880 1700-000000' },
  { icon: Mail, label: 'Email', value: 'support@rapidaid.com' },
  { icon: MapPin, label: 'Office', value: 'Dhanmondi, Dhaka 1209, Bangladesh' },
  { icon: Clock, label: 'Dispatch desk', value: 'Open 24 hours, every day' },
];

export default function ContactPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-12 sm:px-6"
    >
      <PageHeader title="Contact us" description={description} />
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <Card>
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
        <ul className="space-y-4">
          {details.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
