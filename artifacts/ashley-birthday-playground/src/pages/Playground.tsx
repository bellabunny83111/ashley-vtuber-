import React from 'react';
import { Background } from '@/components/Background';
import { Ashley } from '@/components/Ashley';
import { Controls } from '@/components/Controls';
import { MagicBox } from '@/components/MagicBox';
import { Particles } from '@/components/Particles';
import { usePlayground } from '@/lib/PlaygroundContext';
import { useSensors } from '@/hooks/useSensors';

export default function Playground() {
  const { magicEnabled } = usePlayground();
  const { gyro, micVolume, hasMic, hasGyro } = useSensors(magicEnabled);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-background select-none">
      <Background gyroX={gyro.x} gyroY={gyro.y} />
      <Particles />
      <Ashley micVolume={micVolume} />
      <Controls />
      <MagicBox hasMic={hasMic} hasGyro={hasGyro} />
    </div>
  );
}
