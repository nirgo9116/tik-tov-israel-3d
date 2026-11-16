import { useGameStore } from '../../store/gameStore';
import { INTERIORS } from '../../data/interiors';
import type { CityHubId } from '../../types/game';

/** Run a building station: open the investment screen, an info panel, or leave the building. */
export function runStation(interior: CityHubId, stationId: string) {
  const s = useGameStore.getState();
  const st = INTERIORS[interior].stations.find((x) => x.id === stationId);
  if (!st) return;
  if (st.action.kind === 'exit') s.exitBuilding();
  else if (st.action.kind === 'invest') s.setOpenHub(interior);
  else s.setStationInfo(st.id);
}
