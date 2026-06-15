import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import { Check, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCreateShortLink } from '@/api/short-links/hooks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CreateShortLinkDTO } from '@/types/short-link';

export const Route = createFileRoute(
  '/_authenticated/dashboard/short-links/new',
)({
  component: NewShortLinkPage,
  loader: async ({ context }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound({ data: { type: 'organization' } });
    }

    return { activeOrganization };
  },
});

const SLUG_PATTERN = /^[a-zA-Z0-9_-]{3,64}$/;
const DEFAULT_DOMAIN = 'traque.app';

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function NewShortLinkPage() {
  const navigate = useNavigate();
  const { activeOrganization } = Route.useLoaderData();
  const { mutate: create, isPending } = useCreateShortLink(
    activeOrganization.id,
  );

  const [destinationUrl, setDestinationUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState(DEFAULT_DOMAIN);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [clickLimit, setClickLimit] = useState('');

  const [errors, setErrors] = useState<{
    destinationUrl?: string;
    slug?: string;
    clickLimit?: string;
  }>({});

  const slugPreview = useMemo(() => {
    const cleanDomain = domain.trim() || DEFAULT_DOMAIN;
    return `https://${cleanDomain}/${slug.trim() || 'random-slug'}`;
  }, [domain, slug]);

  function validate(): boolean {
    const next: typeof errors = {};

    if (!destinationUrl.trim()) {
      next.destinationUrl = 'Destination URL is required';
    } else if (!isAbsoluteHttpUrl(destinationUrl.trim())) {
      next.destinationUrl =
        'Enter a valid absolute URL including http:// or https://';
    }

    if (slug.trim() && !SLUG_PATTERN.test(slug.trim())) {
      next.slug =
        'Slug must be 3–64 characters and only contain letters, numbers, _ or -';
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

  function handleSubmit() {
    if (!validate()) return;

    const dto: CreateShortLinkDTO = {
      destinationUrl: destinationUrl.trim(),
      slug: slug.trim() || undefined,
      domain: domain.trim() || undefined,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      isActive,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      clickLimit: clickLimit.trim() ? Number(clickLimit) : undefined,
    };

    create(dto, {
      onSuccess: (link) => {
        toast.success('Short link created');
        navigate({
          to: '/dashboard/short-links/$shortLinkId',
          params: { shortLinkId: link.id },
        });
      },
      onError: (error: unknown) => {
        if (isAxiosError(error) && error.response?.status === 409) {
          setErrors((prev) => ({
            ...prev,
            slug: 'This slug is already taken on that domain',
          }));
          toast.error('Slug already taken');
          return;
        }
        const message =
          isAxiosError(error) && error.response?.data?.error?.message
            ? error.response.data.error.message
            : 'Failed to create short link';
        toast.error(message);
      },
    });
  }

  return (
    <div className="pt-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Create Short Link
          </h1>
          <p className="text-muted-foreground text-sm">
            Shorten a destination URL and start tracking clicks
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/dashboard/short-links">Cancel</Link>
        </Button>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Link details</CardTitle>
          <CardDescription>
            Only the destination URL is required. The slug is generated
            automatically if you leave it blank.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="destination-url">Destination URL</Label>
            <Input
              id="destination-url"
              placeholder="https://example.com/very/long/path"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder={DEFAULT_DOMAIN}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">
                Slug{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-link"
                aria-invalid={Boolean(errors.slug)}
              />
              {errors.slug ? (
                <p className="text-xs text-destructive">{errors.slug}</p>
              ) : null}
            </div>
          </div>

          <p className="text-xs text-muted-foreground -mt-2 font-mono break-all">
            {slugPreview}
          </p>

          <div className="grid gap-2">
            <Label htmlFor="title">
              Title{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Spring campaign landing page"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">
              Description{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Internal notes about this link"
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="expires-at">
                Expires at{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for a link that never expires.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="click-limit">
                Click limit{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="click-limit"
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
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is-active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive links redirect to the fallback marketing site.
              </p>
            </div>
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2 px-1 pb-6">
        <Button variant="outline" asChild>
          <Link to="/dashboard/short-links">Cancel</Link>
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 mr-1 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <Check className="size-4 mr-1" /> Create Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
