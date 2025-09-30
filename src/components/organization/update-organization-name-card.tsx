import { revalidateLogic, useForm } from '@tanstack/react-form';
import { type } from 'arktype';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';

export function UpdateOrganizationNameCard() {
  const { data: activeOrganization } = auth.useActiveOrganization();

  const form = useForm({
    defaultValues: {
      name: activeOrganization?.name,
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: type({
        name: type('string > 1').narrow((data, ctx) => {
          if (data !== activeOrganization?.name) {
            return true;
          }

          return ctx.reject({
            expected: 'identical to current name',
            message: 'Name must be different from current name',
            actual: data,
            path: ['name'],
          });
        }),
      }),
    },
    onSubmit: async ({ value }) => {
      if (!activeOrganization?.id) return;

      try {
        await auth.organization.update({
          data: {
            name: value.name?.trim(),
          },
          organizationId: activeOrganization.id,
        });

        toast.success('Organization name updated');
      } catch {
        toast.error('Failed to update organization name');
      }
    },
  });

  return (
    <Card className="w-full shadow-none">
      <CardHeader>
        <CardTitle>Organization name</CardTitle>
      </CardHeader>

      <CardContent>
        <form.Field
          name="name"
          children={(field) => (
            <div>
              <Input
                placeholder="Enter organization name"
                className="w-full md:w-1/3"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={() => field.handleBlur()}
                disabled={!activeOrganization}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-500 mt-2">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        />
      </CardContent>

      <Separator />

      <CardFooter>
        <Button
          size="sm"
          onClick={() => form.handleSubmit()}
          disabled={!activeOrganization}
        >
          Update name
        </Button>
      </CardFooter>
    </Card>
  );
}
