import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, N8AO, Vignette, SMAA } from '@react-three/postprocessing';
import { IsraelMapWorld } from './components/world/IsraelMapWorld';
import { CityHubs } from './components/world/CityHubs';
import { PlayerWithTik } from './components/world/PlayerWithTik';
import { JobMarkers, JobStands, NavArrow } from './components/world/JobMarkers';
import { JobsModal } from './components/ui/JobsModal';
import { Railway, Train, Traffic } from './components/world/Transport';
import { TrainRideBanner } from './components/ui/TrainRideBanner';
import { PaycheckModal } from './components/ui/PaycheckModal';
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
      const anyOpen = s.openHub || s.tikOpen || s.trainOpen || s.infoOpen || s.tutorialOpen || s.paycheck || s.jobsOpen || s.trainRide;
      if (s.tutorialOpen || s.paycheck || s.trainRide) return;

      if (e.code === 'KeyP' || e.code === 'Tab') {
        e.preventDefault();
        s.setTikOpen(!s.tikOpen);
      } else if (e.code === 'Escape') {
        if (s.openHub) s.setOpenHub(null);
        if (s.tikOpen) s.setTikOpen(false);
        if (s.trainOpen) s.setTrainOpen(false);
        if (s.infoOpen) s.setInfoOpen(false);
        if (s.jobsOpen) s.setJobsOpen(false);
      } else if (e.code === 'KeyJ' && !anyOpen) {
        s.setJobsOpen(true);
      } else if ((e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') && !anyOpen && s.nearbyJob && !s.activeJob && s.jobYear !== s.year) {
        e.preventDefault();
        s.startJob(s.nearbyJob);
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
            <JobMarkers />
            <JobStands />
            <NavArrow />
            <Railway />
            <Train />
            <Traffic />
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
      <PaycheckModal />
      <JobsModal />
      <TrainRideBanner />
    </div>
  );
};

export default App;
