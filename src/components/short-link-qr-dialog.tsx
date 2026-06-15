import { Copy, Download, ImageUp, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { type EccLevel, QrCode } from '@/lib/qrcode';
import {
  drawQrToCanvas,
  type QrModuleStyle,
  type QrRenderOptions,
  qrToSvgString,
} from '@/lib/qrcode-render';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  /** Used to build the download filename. */
  slug: string;
};

const DEFAULTS = {
  ecc: 'MEDIUM' as EccLevel,
  resolution: 512,
  margin: 4,
  foreground: '#000000',
  background: '#ffffff',
  transparentBg: false,
  matchEyeColor: true,
  eyeColor: '#000000',
  moduleStyle: 'square' as QrModuleStyle,
  logoRatio: 0.22,
};

const ECC_OPTIONS: { value: EccLevel; label: string }[] = [
  { value: 'LOW', label: 'Low (7%)' },
  { value: 'MEDIUM', label: 'Medium (15%)' },
  { value: 'QUARTILE', label: 'Quartile (25%)' },
  { value: 'HIGH', label: 'High (30%)' },
];

const MODULE_STYLES: { value: QrModuleStyle; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
];

const COLOR_PRESETS: { fg: string; bg: string }[] = [
  { fg: '#000000', bg: '#ffffff' },
  { fg: '#ffffff', bg: '#0a0a0a' },
  { fg: '#4f46e5', bg: '#ffffff' },
  { fg: '#059669', bg: '#ffffff' },
  { fg: '#e11d48', bg: '#ffffff' },
  { fg: '#0ea5e9', bg: '#0b1120' },
];

export function ShortLinkQrDialog({ open, onOpenChange, url, slug }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ecc, setEcc] = useState<EccLevel>(DEFAULTS.ecc);
  const [resolution, setResolution] = useState(DEFAULTS.resolution);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [foreground, setForeground] = useState(DEFAULTS.foreground);
  const [background, setBackground] = useState(DEFAULTS.background);
  const [transparentBg, setTransparentBg] = useState(DEFAULTS.transparentBg);
  const [matchEyeColor, setMatchEyeColor] = useState(DEFAULTS.matchEyeColor);
  const [eyeColor, setEyeColor] = useState(DEFAULTS.eyeColor);
  const [moduleStyle, setModuleStyle] = useState<QrModuleStyle>(
    DEFAULTS.moduleStyle,
  );
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [logoRatio, setLogoRatio] = useState(DEFAULTS.logoRatio);

  const qr = useMemo(() => {
    if (!url) return null;
    try {
      return QrCode.encodeText(url, ecc);
    } catch {
      return null;
    }
  }, [url, ecc]);

  const renderOptions = useMemo<QrRenderOptions>(
    () => ({
      size: resolution,
      margin,
      foreground,
      background: transparentBg ? 'transparent' : background,
      eyeColor: matchEyeColor ? undefined : eyeColor,
      moduleStyle,
    }),
    [
      resolution,
      margin,
      foreground,
      background,
      transparentBg,
      matchEyeColor,
      eyeColor,
      moduleStyle,
    ],
  );

  useEffect(() => {
    if (!logoDataUrl) {
      setLogoImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLogoImage(img);
    img.onerror = () => {
      setLogoImage(null);
      toast.error('Could not load that logo image');
    };
    img.src = logoDataUrl;
  }, [logoDataUrl]);

  useEffect(() => {
    if (!open || !qr || !canvasRef.current) return;
    drawQrToCanvas(canvasRef.current, qr, renderOptions, {
      image: logoImage,
      dataUrl: logoDataUrl,
      ratio: logoRatio,
    });
  }, [open, qr, renderOptions, logoImage, logoDataUrl, logoRatio]);

  function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.onerror = () => toast.error('Could not read that file');
    reader.readAsDataURL(file);
    if (ecc === 'LOW' || ecc === 'MEDIUM') setEcc('HIGH');
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${slug || 'short-link'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('PNG downloaded');
  }

  function downloadSvg() {
    if (!qr) return;
    const svg = qrToSvgString(qr, renderOptions, {
      image: null,
      dataUrl: logoDataUrl,
      ratio: logoRatio,
    });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr-${slug || 'short-link'}.svg`;
    link.href = objectUrl;
    link.click();
    URL.revokeObjectURL(objectUrl);
    toast.success('SVG downloaded');
  }

  async function copyPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
      );
      if (!blob) throw new Error('No image');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      toast.success('QR code copied to clipboard');
    } catch {
      toast.error('Copying images is not supported in this browser');
    }
  }

  function resetStyles() {
    setEcc(DEFAULTS.ecc);
    setResolution(DEFAULTS.resolution);
    setMargin(DEFAULTS.margin);
    setForeground(DEFAULTS.foreground);
    setBackground(DEFAULTS.background);
    setTransparentBg(DEFAULTS.transparentBg);
    setMatchEyeColor(DEFAULTS.matchEyeColor);
    setEyeColor(DEFAULTS.eyeColor);
    setModuleStyle(DEFAULTS.moduleStyle);
    setLogoDataUrl(null);
    setLogoRatio(DEFAULTS.logoRatio);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>QR code</DialogTitle>
          <DialogDescription className="truncate">
            Customize and download a QR code for{' '}
            <span className="font-mono">{url}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'rounded-lg border p-3 w-full max-w-[220px] aspect-square flex items-center justify-center',
                transparentBg &&
                  'bg-[repeating-conic-gradient(#e5e7eb_0_25%,#fff_0_50%)] bg-[length:16px_16px]',
              )}
            >
              {qr ? (
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <span className="text-xs text-muted-foreground text-center px-2">
                  Unable to generate a QR code for this URL.
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-[220px]">
              <Button size="sm" onClick={downloadPng} disabled={!qr}>
                <Download className="size-4 mr-1" /> PNG
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadSvg}
                disabled={!qr}
              >
                <Download className="size-4 mr-1" /> SVG
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={copyPng}
                disabled={!qr}
                className="col-span-2"
              >
                <Copy className="size-4 mr-1" /> Copy image
              </Button>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={`${preset.fg}-${preset.bg}`}
                  type="button"
                  onClick={() => {
                    setForeground(preset.fg);
                    setBackground(preset.bg);
                    setTransparentBg(false);
                  }}
                  className="size-7 rounded-md border overflow-hidden shrink-0"
                  style={{ background: preset.bg }}
                  aria-label="Apply color preset"
                >
                  <span
                    className="block size-3.5 rounded-sm m-auto"
                    style={{ background: preset.fg }}
                  />
                </button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto"
                onClick={resetStyles}
              >
                <RotateCcw className="size-3.5 mr-1" /> Reset
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField
                label="Foreground"
                value={foreground}
                onChange={setForeground}
              />
              <ColorField
                label="Background"
                value={background}
                onChange={setBackground}
                disabled={transparentBg}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-2.5">
              <Label htmlFor="qr-transparent" className="text-sm font-normal">
                Transparent background
              </Label>
              <Switch
                id="qr-transparent"
                checked={transparentBg}
                onCheckedChange={setTransparentBg}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-2.5">
              <Label htmlFor="qr-match-eye" className="text-sm font-normal">
                Match eye color to foreground
              </Label>
              <Switch
                id="qr-match-eye"
                checked={matchEyeColor}
                onCheckedChange={setMatchEyeColor}
              />
            </div>

            {!matchEyeColor ? (
              <ColorField
                label="Eye color"
                value={eyeColor}
                onChange={setEyeColor}
              />
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Module style
                </Label>
                <Select
                  value={moduleStyle}
                  onValueChange={(v) => setModuleStyle(v as QrModuleStyle)}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODULE_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Error correction
                </Label>
                <Select
                  value={ecc}
                  onValueChange={(v) => setEcc(v as EccLevel)}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ECC_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  Quiet zone (margin)
                </Label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {margin}
                </span>
              </div>
              <Slider
                value={[margin]}
                min={0}
                max={8}
                step={1}
                onValueChange={([v]) => setMargin(v)}
              />
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  Export resolution
                </Label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {resolution}px
                </span>
              </div>
              <Slider
                value={[resolution]}
                min={256}
                max={1024}
                step={64}
                onValueChange={([v]) => setResolution(v)}
              />
            </div>

            <div className="grid gap-2 rounded-md border p-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">Center logo</Label>
                {logoDataUrl ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-destructive"
                    onClick={() => setLogoDataUrl(null)}
                  >
                    <Trash2 className="size-3.5 mr-1" /> Remove
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="h-7" asChild>
                    <label className="cursor-pointer">
                      <ImageUp className="size-3.5 mr-1" /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleLogoUpload(e.target.files?.[0] ?? undefined)
                        }
                      />
                    </label>
                  </Button>
                )}
              </div>
              {logoDataUrl ? (
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      Logo size
                    </Label>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {Math.round(logoRatio * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[logoRatio]}
                    min={0.1}
                    max={0.32}
                    step={0.01}
                    onValueChange={([v]) => setLogoRatio(v)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Tip: a logo covers part of the code — keep error correction
                    on High so it still scans.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Add a brand logo to the center of the QR code (PNG or SVG).
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 rounded-md border bg-transparent p-0.5 disabled:opacity-50"
          aria-label={label}
        />
        <Input
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 font-mono text-sm uppercase"
        />
      </div>
    </div>
  );
}
