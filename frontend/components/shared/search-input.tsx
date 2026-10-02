import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  label = 'Search',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative w-full sm:max-w-xs', className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="pr-8 pl-8 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
