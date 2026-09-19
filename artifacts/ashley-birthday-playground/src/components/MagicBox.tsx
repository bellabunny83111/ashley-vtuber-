import React from 'react';
import { Settings, Camera, Mic, Smartphone, Info } from 'lucide-react';
import { usePlayground } from '@/lib/PlaygroundContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function MagicBox({ hasMic, hasGyro }: { hasMic: boolean, hasGyro: boolean }) {
  const { magicEnabled, setMagicEnabled, setAction, emitParticles, setRedStringActive, isRedStringActive } = usePlayground();

  return (
    <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full shadow-lg h-12 w-12 bg-white hover:bg-pink-50 border-2 border-primary/20">
            <Settings className="h-6 w-6 text-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 rounded-2xl p-4 border-2 border-primary/20 bg-white/95 backdrop-blur-sm" align="end">
          <div className="space-y-4">
            <h4 className="font-bold text-lg text-primary flex items-center gap-2">
              <Info className="h-5 w-5" />
              Magic Settings
            </h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Enable Magic</Label>
                <p className="text-xs text-muted-foreground">Sensor & mic features</p>
              </div>
              <Switch checked={magicEnabled} onCheckedChange={setMagicEnabled} />
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Mic className={`h-4 w-4 ${hasMic ? 'text-green-500' : 'text-gray-400'}`} />
                <span>Voice React {hasMic ? '(Active)' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <Smartphone className={`h-4 w-4 ${hasGyro ? 'text-green-500' : 'text-gray-400'}`} />
                <span>Motion Parallax {hasGyro ? '(Active)' : ''}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Secret Actions</p>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={() => {
                emitParticles('rain');
              }}>
                🍓 Strawberry Rain
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={() => {
                setRedStringActive(!isRedStringActive);
              }}>
                🧶 7/7 Red String
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
