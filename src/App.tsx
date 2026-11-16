import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { IsraelMapWorld } from './components/world/IsraelMapWorld';
import { CityHubs } from './components/world/CityHubs';
import { PlayerWithTik } from './components/world/PlayerWithTik';
import { HUD } from './components/ui/HUD';
import { HubModal } from './components/ui/HubModal';
import { TikBagModal } from './components/ui/TikBagModal';
import { useGameStore } from './store/gameStore';

export const App: React.FC = () => {
  const nearbyHub = useGameStore((s) => s.nearbyHub);
  const openHub = useGameStore((s) => s.openHub);
  const tikOpen = useGameStore((s) => s.tikOpen);
  const setOpenHub = useGameStore((s) => s.setOpenHub);
  const setTikOpen = useGameStore((s) => s.setTikOpen);
  const toggleVehicle = useGameStore((s) => s.toggleVehicle);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Tab') {
        e.preventDefault();
        setTikOpen(!tikOpen);
      } else if (e.code === 'Escape') {
        if (openHub) setOpenHub(null);
        if (tikOpen) setTikOpen(false);
      } else if (e.code === 'Enter' || e.code === 'Space') {
        if (!openHub && !tikOpen && nearbyHub) {
          e.preventDefault();
          setOpenHub(nearbyHub);
        }
      } else if (e.code === 'KeyE') {
        if (!openHub && !tikOpen) {
          toggleVehicle();
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nearbyHub, openHub, tikOpen, setOpenHub, setTikOpen, toggleVehicle]);

  return (
    <div className="game-root">
      <Canvas shadows camera={{ position: [-6, 7.5, -15], fov: 50 }}>
        <IsraelMapWorld />
        <CityHubs />
        <PlayerWithTik />
      </Canvas>
      <HUD />
      <HubModal />
      <TikBagModal />
    </div>
  );
};

export default App;
