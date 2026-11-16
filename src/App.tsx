import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, N8AO, Vignette, SMAA } from '@react-three/postprocessing';
import { IsraelMapWorld } from './components/world/IsraelMapWorld';
import { CityHubs } from './components/world/CityHubs';
import { PlayerWithTik } from './components/world/PlayerWithTik';
import { HUD } from './components/ui/HUD';
import { HubModal } from './components/ui/HubModal';
import { TikBagModal } from './components/ui/TikBagModal';
import { TrainModal } from './components/ui/TrainModal';
import { InfoModal } from './components/ui/InfoModal';
import { TutorialModal } from './components/ui/TutorialModal';
import { LiteMap } from './components/ui/LiteMap';
import { useGameStore } from './store/gameStore';

export const App: React.FC = () => {
  const liteMode = useGameStore((s) => s.liteMode);
  const highGraphics = useGameStore((s) => s.highGraphics);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const s = useGameStore.getState();
      const anyOpen = s.openHub || s.tikOpen || s.trainOpen || s.infoOpen || s.tutorialOpen;
      if (s.tutorialOpen) return;

      if (e.code === 'KeyP' || e.code === 'Tab') {
        e.preventDefault();
        s.setTikOpen(!s.tikOpen);
      } else if (e.code === 'Escape') {
        if (s.openHub) s.setOpenHub(null);
        if (s.tikOpen) s.setTikOpen(false);
        if (s.trainOpen) s.setTrainOpen(false);
        if (s.infoOpen) s.setInfoOpen(false);
      } else if (e.code === 'KeyM' && !s.liteMode && !anyOpen) {
        s.setOverview(!s.overview);
      } else if (e.code === 'KeyT' && !s.liteMode && !anyOpen) {
        s.setTrainOpen(true);
      } else if ((e.code === 'Enter' || e.code === 'Space') && !anyOpen && s.nearbyHub) {
        e.preventDefault();
        s.setOpenHub(s.nearbyHub);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="game-root">
      {liteMode ? (
        <LiteMap />
      ) : (
        <Canvas
          shadows
          dpr={highGraphics ? [1, 2] : [1, 1.5]}
          gl={{ antialias: !highGraphics, powerPreference: 'high-performance' }}
          camera={{ position: [-6, 7.5, -15], fov: 50, far: 6000 }}
        >
          <Suspense fallback={null}>
            <IsraelMapWorld />
            <CityHubs />
            <PlayerWithTik />
          </Suspense>
          {highGraphics && (
            <EffectComposer multisampling={0}>
              <N8AO aoRadius={2.5} intensity={2.2} distanceFalloff={1} halfRes />
              <Bloom intensity={0.35} luminanceThreshold={0.85} mipmapBlur />
              <SMAA />
              <Vignette offset={0.3} darkness={0.5} />
            </EffectComposer>
          )}
        </Canvas>
      )}
      <HUD />
      <HubModal />
      <TikBagModal />
      <TrainModal />
      <InfoModal />
      <TutorialModal />
    </div>
  );
};

export default App;
