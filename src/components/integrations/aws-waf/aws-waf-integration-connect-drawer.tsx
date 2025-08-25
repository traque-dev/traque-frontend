import { revalidateLogic, useForm } from '@tanstack/react-form';
import { type } from 'arktype';
import { type PropsWithChildren, useState } from 'react';
import { toast } from 'sonner';
import { useSetAwsWafCredentials } from '@/api/integrations/aws/waf/hooks';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { auth } from '@/lib/auth';

const AWS_REGIONS = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'eu-north-1',
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'me-central-1',
  'me-south-1',
];

const awsWafCredentialsSchema = type({
  region: 'string',
  accessKeyId: type('string > 1').configure({
    message: 'Access Key ID is required',
  }),
  secretAccessKey: type('string > 1').configure({
    message: 'Secret Access Key is required',
  }),
});

export function AwsWafIntegrationConnectDrawer({
  children,
}: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const { data: activeOrganization } = auth.useActiveOrganization();

  const organizationId = activeOrganization?.id;

  const setCredsMutation = useSetAwsWafCredentials(organizationId);

  const form = useForm({
    defaultValues: {
      region: 'us-east-1',
      accessKeyId: '',
      secretAccessKey: '',
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: awsWafCredentialsSchema,
    },
    onSubmit: async ({ value }) => {
      if (!organizationId) {
        toast.error('No active organization. Please select an organization.');
        return;
      }
      try {
        await setCredsMutation.mutateAsync(value);
        toast.success('AWS WAF connected');
        setOpen(false);
      } catch (e) {
        toast.error('Failed to save credentials');
      }
    },
  });

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children ?? <Button size="sm">Connect</Button>}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-6">
          <DrawerTitle>Connect AWS WAF</DrawerTitle>
          <DrawerDescription>
            Enter your AWS credentials to allow Traque to ingest WAF insights.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-2">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-4 grid gap-1">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Credentials
              </Label>
              <p className="text-muted-foreground text-sm">
                Your keys are used to securely fetch WAF data. You can revoke
                access anytime in AWS.
              </p>
            </div>

            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <form.Field name="region">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Region</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select AWS region" />
                      </SelectTrigger>
                      <SelectContent>
                        {AWS_REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 ? (
                      <p className="text-destructive text-sm">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              <form.Field name="accessKeyId">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Access Key ID</Label>
                    <Input
                      id={field.name}
                      placeholder="AKIA..."
                      autoComplete="off"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={setCredsMutation.isPending}
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <p className="text-destructive text-sm">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              <form.Field name="secretAccessKey">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Secret Access Key</Label>
                    <Input
                      id={field.name}
                      type="password"
                      placeholder="••••••••••••••••"
                      autoComplete="off"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={setCredsMutation.isPending}
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <p className="text-destructive text-sm">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              <div className="h-1" />

              <div className="flex items-center justify-end gap-2">
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  disabled={!organizationId || setCredsMutation.isPending}
                >
                  {setCredsMutation.isPending ? 'Saving…' : 'Save & Connect'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
}
