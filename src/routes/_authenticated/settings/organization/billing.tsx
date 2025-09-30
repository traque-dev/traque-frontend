import { createFileRoute, notFound } from '@tanstack/react-router';
import {
  BadgeCheck,
  Check,
  Cloud,
  Globe,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { getActiveSubscriptionQueryOptions } from '@/api/billing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';

export const Route = createFileRoute(
  '/_authenticated/settings/organization/billing',
)({
  loader: async ({ context }) => {
    const activeOrganization = await context.getActiveOrganization();

    if (!activeOrganization) {
      throw notFound();
    }

    const subscription = await context.queryClient.ensureQueryData(
      getActiveSubscriptionQueryOptions(activeOrganization.id),
    );

    return {
      activeOrganization,
      subscription,
    };
  },
  component: Billing,
});

function Billing() {
  const { activeOrganization, subscription } = Route.useLoaderData();

  const features: FeatureRow[] = useMemo(
    () => [
      {
        icon: <BadgeCheck />,
        label: 'Unlimited exceptions and events',
        enabled: true,
      },
      { icon: <Cloud />, label: 'Long-term data retention', enabled: true },
      {
        icon: <Globe />,
        label: 'AI Chat for on-demand insights',
        enabled: true,
      },
      {
        icon: <Rocket />,
        label: 'AI Agents to analyze and help fix issues',
        enabled: true,
      },
      { icon: <ShieldCheck />, label: 'Priority support', enabled: true },
    ],
    [],
  );

  const isPlus = subscription?.plan === 'plus';

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
          <p className="text-muted-foreground text-sm">
            Manage your plan and billing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              toast.dismiss();
              const toastId = toast.loading('Opening invoices...');
              try {
                await auth.customer.portal();
              } catch (e) {
                toast.error('Failed to open portal');
              } finally {
                toast.dismiss(toastId);
              }
            }}
          >
            Invoices
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              toast.dismiss();
              const toastId = toast.loading('Opening usage...');
              try {
                await auth.customer.portal();
              } catch (e) {
                toast.error('Failed to open portal');
              } finally {
                toast.dismiss(toastId);
              }
            }}
          >
            Usage
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-1">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Badge className="w-fit">Plus</Badge>
          <div className="text-xl font-semibold">
            {isPlus ? "You're on Plus" : 'Upgrade to Plus'}
          </div>
          <p className="text-muted-foreground max-w-3xl text-sm">
            Traque Plus unlocks unlimited exceptions and events, long-term data
            retention, AI chat for on-demand insights, AI agents to analyze and
            help fix issues, and priority support.
          </p>
        </div>

        <div className="grid gap-3">
          <ul className="grid gap-2">
            {features.map((f) => (
              <FeatureItem key={f.label} {...f} />
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between py-4">
          <a
            href="https://www.traque.dev/pricing"
            target="_blank"
            className="text-muted-foreground text-sm"
          >
            Learn more about Pricing and Plans
          </a>
          <div className="flex gap-2">
            {isPlus ? (
              <Button
                onClick={async () => {
                  toast.dismiss();
                  const toastId = toast.loading('Opening billing portal...');
                  try {
                    await auth.customer.portal();
                  } catch (e) {
                    toast.error('Failed to open portal');
                  } finally {
                    toast.dismiss(toastId);
                  }
                }}
              >
                Manage
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  toast.dismiss();
                  const toastId = toast.loading('Redirecting to checkout...');
                  try {
                    await auth.checkout({
                      slug: 'plus',
                      referenceId: activeOrganization.id,
                    });
                  } catch (e) {
                    toast.error('Failed to start checkout');
                  } finally {
                    toast.dismiss(toastId);
                  }
                }}
              >
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type FeatureRow = {
  icon: React.ReactNode;
  label: string;
  meta?: string;
  enabled?: boolean;
};

function FeatureItem({ icon, label, meta, enabled = true }: FeatureRow) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground [&>svg]:size-4">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {meta ? (
          <span className="text-muted-foreground text-xs">{meta}</span>
        ) : null}
        {enabled ? (
          <div className="bg-primary/10 text-primary grid size-6 place-items-center rounded-full">
            <Check className="size-3.5" />
          </div>
        ) : null}
      </div>
    </li>
  );
}
