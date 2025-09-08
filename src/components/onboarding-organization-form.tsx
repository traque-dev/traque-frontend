import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { generateSlug } from '@/lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type Props = {
  onStepChange: (step: number) => void;
};

export function NewOrganizationForm({ onStepChange }: Props) {
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgCreating, setOrgCreating] = useState(false);

  useEffect(() => {
    if (!orgName) {
      setOrgSlug('');
      return;
    }

    setOrgSlug(generateSlug(orgName));
  }, [orgName]);

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
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="grid gap-2 mt-2">
        <Label htmlFor="org-slug">Slug</Label>
        <Input
          id="org-slug"
          placeholder="acme"
          value={orgSlug}
          onChange={(e) => setOrgSlug(e.target.value)}
        />
      </div>

      <Button
        type="button"
        disabled={!orgName || !orgSlug || orgCreating}
        onClick={() => {
          setOrgCreating(true);
          setTimeout(() => {
            setOrgCreating(false);
            onStepChange(2);
          }, 900);
        }}
        className="w-full mt-3"
      >
        {orgCreating ? 'Creating…' : 'Create organization'}
      </Button>
    </motion.form>
  );
}
