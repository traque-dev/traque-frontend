import { motion } from 'motion/react';
import { useState } from 'react';
import { useCreateProject } from '@/api/projects/hooks';
import { NestjsLogo } from '@/components/icons/nestjs-logo';
import { NodejsLogo } from '@/components/icons/nodejs-logo';
import { ReactLogo } from '@/components/icons/react-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/auth';
import { Platform } from '@/types/platform';

type Props = {
  onStepChange: (step: number) => void;
};

export function NewProjectForm({ onStepChange }: Props) {
  const { data: organization, isPending: isPendingOrganization } =
    auth.useActiveOrganization();

  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<Platform | null>(null);

  const { mutate: createProject, isPending: isCreatingProject } =
    useCreateProject(organization?.id);

  const isPending = isPendingOrganization || isCreatingProject;

  return (
    <motion.form
      className="mt-6 grid gap-4 text-left"
      onSubmit={(e) => e.preventDefault()}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 'clamp(18px, 4vw, 28px)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          Create your first project
        </div>
        <div style={{ marginTop: 6, color: 'var(--muted-foreground)' }}>
          Name it and choose a platform to start tracking
        </div>
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <Label htmlFor="project-name">Project name</Label>
        <Input
          id="project-name"
          placeholder="Web App"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="grid gap-3 mt-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Label>Platform</Label>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          {[
            {
              key: Platform.REACT,
              name: 'React',
              Logo: ReactLogo,
            },
            {
              key: Platform.NODE_JS,
              name: 'Node.js',
              Logo: NodejsLogo,
            },
            {
              key: Platform.NEST_JS,
              name: 'NestJS',
              Logo: NestjsLogo,
            },
          ].map(({ key, name, Logo }) => {
            const selected = platform === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPlatform(key)}
                style={{
                  cursor: 'pointer',
                  borderRadius: 12,
                  padding: 12,
                  border: `1px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                  background: selected
                    ? 'color-mix(in oklab, var(--primary) 12%, transparent)'
                    : 'transparent',
                  display: 'grid',
                  placeItems: 'center',
                  gap: 8,
                  transition: 'all 160ms ease',
                }}
              >
                <Logo width={40} height={40} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        <Button
          type="button"
          disabled={!name || !platform || isPending}
          onClick={() => {
            if (!platform) return;

            createProject(
              {
                name,
                platform,
              },
              {
                onSuccess: () => {
                  onStepChange(3);
                },
              },
            );
          }}
          style={{ paddingLeft: 16, paddingRight: 16 }}
        >
          {isCreatingProject ? 'Creating…' : 'Create project'}
        </Button>
      </div>
    </motion.form>
  );
}
