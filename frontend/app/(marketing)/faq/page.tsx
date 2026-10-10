import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';

const title = 'FAQ';
const description = 'Answers to common questions about requesting, tracking and paying for a trip.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title: `${title} | RapidAid`, description, url: '/faq' },
};

const faqs = [
  {
    question: 'How do I request an ambulance?',
    answer:
      'Create a patient account, open the new request form and enter the pickup location, the patient condition and a priority. The nearest suitable ambulance is assigned automatically.',
  },
  {
    question: 'What do the priority levels mean?',
    answer:
      'Requests are ranked CRITICAL, HIGH, MEDIUM or LOW. When ambulances are limited, higher priority requests are served before lower ones, regardless of who asked first.',
  },
  {
    question: 'Which ambulance type should I choose?',
    answer:
      'BASIC suits routine transfers, AC adds a climate-controlled cabin, ICU carries ventilators and a cardiac monitor for intensive care, and FREEZER is for the transport of the deceased.',
  },
  {
    question: 'What happens if no ambulance is available?',
    answer:
      'The request is marked as no ambulance available and stays on record so you can raise it again. Nothing is charged for a request that was never dispatched.',
  },
  {
    question: 'Can I track my ambulance?',
    answer:
      'Yes. Every trip moves through dispatched, en route to pickup, patient picked up, en route to hospital and arrived, and you are notified at each change.',
  },
  {
    question: 'How is the fare calculated and paid?',
    answer:
      'The fare is based on the distance travelled and calculated when the trip completes. You then pay securely online through SSLCommerz.',
  },
  {
    question: 'How do I join as a driver?',
    answer:
      'Register a driver account, complete your driver profile with your licence and vehicle details, and set yourself available to start receiving dispatches.',
  },
];

export default function FaqPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-4 py-12 sm:px-6"
    >
      <PageHeader title="Frequently asked questions" description={description} />
      <div className="divide-y rounded-xl border">
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group px-4 py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
              {question}
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="pb-4 text-sm text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-muted/50 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-medium">Still have a question?</p>
          <p className="text-sm text-muted-foreground">
            Our dispatch desk answers around the clock.
          </p>
        </div>
        <Button asChild>
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </main>
  );
}
