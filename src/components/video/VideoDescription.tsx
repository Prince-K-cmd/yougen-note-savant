
interface VideoDescriptionProps {
  description: string;
}

export function VideoDescription({ description }: VideoDescriptionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Description</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {description}
      </p>
    </div>
  );
}
