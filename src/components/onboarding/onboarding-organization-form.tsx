import { useDebouncedValue } from '@tanstack/react-pacer';
import { useMutation } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { match } from 'ts-pattern';
import { Loader } from '@/components/ai/loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

type Props = {
  onStepChange: (step: number) => void;
};

export function NewOrganizationForm({ onStepChange }: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const [debouncedSlug] = useDebouncedValue(slug, {
    wait: 400,
    trailing: true,
  });

  const {
    mutate: checkSlug,
    isPending: isCheckingSlug,
    data: isSlugTaken,
    reset,
  } = useMutation({
    mutationFn: async (slug: string) => {
      const { error } = await auth.organization.checkSlug({
        slug,
      });

      return !!error;
    },
  });

  useEffect(() => {
    reset();
    if (!debouncedSlug) return;

    checkSlug(debouncedSlug);
  }, [debouncedSlug]);

  useEffect(() => {
    if (!name) {
      setSlug('');
      return;
    }

    setSlug(generateSlug(name));
  }, [name]);

  const { mutate: createOrganization, isPending: isCreatingOrganization } =
    useMutation({
      mutationFn: async () => {
        await auth.organization.create({
          name,
          slug,
          keepCurrentActiveOrganization: false,
        });
      },
      onSuccess: () => {
        onStepChange(2);
      },
      onError: () => {
        toast.error('Failed to create organization');
      },
    });

  return (
    <motion.form
      className="mt-6 grid gap-4 text-left"
      onSubmit={(e) => e.preventDefault()}
    >
      <motion.div
        key="start"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div
          style={{
            fontSize: 'clamp(18px, 4vw, 28px)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          Let&apos;s get started by creating your organization
        </div>
      </motion.div>
      <div className="grid gap-2 mt-3">
        <Label htmlFor="org-name">Organization name</Label>
        <Input
          id="org-name"
          placeholder="Acme Inc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="grid gap-2 mt-2">
        <Label htmlFor="org-slug">Slug</Label>
        <div style={{ position: 'relative' }}>
          <Input
            id="org-slug"
            placeholder="acme"
            value={slug}
            onChange={(e) => {
              setSlug(generateSlug(e.target.value.replace(' ', '-')));
            }}
            className="pr-8"
          />
          {slug ? (
            <div
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
              aria-hidden
            >
              {match({ isCheckingSlug, isSlugTaken })
                .with({ isCheckingSlug: true }, () => <Loader size={16} />)
                .with({ isSlugTaken: true }, () => (
                  <X className="h-4 w-4 text-destructive" />
                ))
                .with({ isSlugTaken: false }, () => (
                  <Check className="h-4 w-4 text-emerald-500" />
                ))
                .otherwise(() => null)}
            </div>
          ) : null}
        </div>
      </div>

      <Button
        type="button"
        disabled={
          !name ||
          !slug ||
          isCreatingOrganization ||
          isCheckingSlug ||
          isSlugTaken
        }
        onClick={() => {
          createOrganization();
        }}
        className="w-full mt-3"
      >
        {isCreatingOrganization ? 'Creating…' : 'Create organization'}
      </Button>
    </motion.form>
  );
}
