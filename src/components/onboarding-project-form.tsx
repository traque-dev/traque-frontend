import { motion } from 'motion/react';
import { useState } from 'react';
import { Platform } from '@/types/platform';
import { NestjsLogo } from './icons/nestjs-logo';
import { NodejsLogo } from './icons/nodejs-logo';
import { ReactLogo } from './icons/react-logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type Props = {
  onStepChange: (step: number) => void;
};

export function NewProjectForm({ onStepChange }: Props) {
  const [projectName, setProjectName] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null,
  );
  const [projectCreating, setProjectCreating] = useState(false);

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
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
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
            const selected = selectedPlatform === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPlatform(key)}
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
          disabled={!projectName || !selectedPlatform || projectCreating}
          onClick={() => {
            setProjectCreating(true);
            setTimeout(() => {
              setProjectCreating(false);
              onStepChange(3);
            }, 1000);
          }}
          style={{ paddingLeft: 16, paddingRight: 16 }}
        >
          {projectCreating ? 'Creating…' : 'Create project'}
        </Button>
      </div>
    </motion.form>
  );
}
