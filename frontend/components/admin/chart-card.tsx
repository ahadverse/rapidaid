import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ChartCardProps = {
  title: string;
  description: string;
  summary: { label: string; value: string }[];
  children: ReactNode;
};

export function ChartCard({ title, description, summary, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full" role="img" aria-label={`${title}. ${description}`}>
          {children}
        </div>
        <table className="sr-only">
          <caption>{title}</caption>
          <tbody>
            {summary.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
