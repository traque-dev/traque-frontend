import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUpdateShortLink } from '@/api/short-links/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { dayjs } from '@/lib/dayjs';
import type { Organization } from '@/types/organization';
import type { ShortLink, UpdateShortLinkDTO } from '@/types/short-link';

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: Organization['id'];
  link: ShortLink;
};

export function ShortLinkEditSheet({
  open,
  onOpenChange,
  organizationId,
  link,
}: Props) {
  const { mutate: update, isPending } = useUpdateShortLink(
    organizationId,
    link.id,
  );

  const [destinationUrl, setDestinationUrl] = useState(link.destinationUrl);
  const [title, setTitle] = useState(link.title ?? '');
  const [description, setDescription] = useState(link.description ?? '');
  const [isActive, setIsActive] = useState(link.isActive);
  const [expiresAt, setExpiresAt] = useState(
    link.expiresAt ? dayjs(link.expiresAt).format('YYYY-MM-DDTHH:mm') : '',
  );
  const [clickLimit, setClickLimit] = useState(
    link.clickLimit != null ? String(link.clickLimit) : '',
  );

  const [errors, setErrors] = useState<{
    destinationUrl?: string;
    clickLimit?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setDestinationUrl(link.destinationUrl);
    setTitle(link.title ?? '');
    setDescription(link.description ?? '');
    setIsActive(link.isActive);
    setExpiresAt(
      link.expiresAt ? dayjs(link.expiresAt).format('YYYY-MM-DDTHH:mm') : '',
    );
    setClickLimit(link.clickLimit != null ? String(link.clickLimit) : '');
    setErrors({});
  }, [open, link]);

  function validate(): boolean {
    const next: typeof errors = {};

    if (!destinationUrl.trim()) {
      next.destinationUrl = 'Destination URL is required';
    } else if (!isAbsoluteHttpUrl(destinationUrl.trim())) {
      next.destinationUrl =
        'Enter a valid absolute URL including http:// or https://';
    }

    if (clickLimit.trim()) {
      const parsed = Number(clickLimit);
      if (!Number.isInteger(parsed) || parsed < 1) {
        next.clickLimit = 'Click limit must be a whole number of at least 1';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const dto: UpdateShortLinkDTO = {
      destinationUrl: destinationUrl.trim(),
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      isActive,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      clickLimit: clickLimit.trim() ? Number(clickLimit) : null,
    };

    update(dto, {
      onSuccess: () => {
        toast.success('Short link updated');
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        const message =
          isAxiosError(error) && error.response?.data?.error?.message
            ? error.response.data.error.message
            : 'Failed to update short link';
        toast.error(message);
      },
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit short link</SheetTitle>
          <SheetDescription>
            The slug and domain cannot be changed after creation.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4">
          <div className="grid gap-2">
            <Label>Short URL</Label>
            <Input
              value={link.shortUrl}
              readOnly
              disabled
              className="font-mono"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-destination">Destination URL</Label>
            <Input
              id="edit-destination"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              aria-invalid={Boolean(errors.destinationUrl)}
            />
            {errors.destinationUrl ? (
              <p className="text-xs text-destructive">
                {errors.destinationUrl}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-expires">Expires at</Label>
            <Input
              id="edit-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for a link that never expires.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-click-limit">Click limit</Label>
            <Input
              id="edit-click-limit"
              type="number"
              min={1}
              step={1}
              value={clickLimit}
              onChange={(e) => setClickLimit(e.target.value)}
              placeholder="Unlimited"
              aria-invalid={Boolean(errors.clickLimit)}
            />
            {errors.clickLimit ? (
              <p className="text-xs text-destructive">{errors.clickLimit}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited clicks.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="edit-active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Disable to stop redirecting visitors.
              </p>
            </div>
            <Switch
              id="edit-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" /> Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
