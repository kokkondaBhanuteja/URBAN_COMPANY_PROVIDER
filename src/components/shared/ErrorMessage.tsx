import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string;
  retry: () => void;
}

export default function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4 text-center">
      <p className="text-destructive">{message}</p>
      <Button onClick={retry} variant="outline">Retry</Button>
    </div>
  );
}