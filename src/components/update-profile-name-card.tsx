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

export function UpdateProfileNameCard() {
  const { data: session } = auth.useSession();

  const form = useForm({
    defaultValues: {
      name: session?.user?.name,
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: type({
        name: type('string > 1').narrow((data, ctx) => {
          if (data !== session?.user.name) {
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
      try {
        await auth.updateUser({
          name: value.name?.trim(),
        });

        toast.success('Name updated');
      } catch {
        toast.error('Failed to update name');
      }
    },
  });

  return (
    <Card className="w-full shadow-none">
      <CardHeader>
        <CardTitle>Your name</CardTitle>
      </CardHeader>

      <CardContent>
        <form.Field
          name="name"
          children={(field) => (
            <div>
              <Input
                placeholder="Enter your name"
                className="w-full md:w-1/3"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={() => field.handleBlur()}
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
        <Button size="sm" onClick={() => form.handleSubmit()}>
          Update name
        </Button>
      </CardFooter>
    </Card>
  );
}
