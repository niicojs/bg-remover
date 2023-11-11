import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ViewError({
  error,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { error: string }) {
  return (
    <Alert variant="destructive" {...props}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription> {error}</AlertDescription>
    </Alert>
  );
}
