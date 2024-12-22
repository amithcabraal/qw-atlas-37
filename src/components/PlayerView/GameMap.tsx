import React, { forwardRef } from 'react';
import MapComponent from '../MapComponent';
import type { MapRef } from '../../types/map';

interface GameMapProps {
  mapKey: number;
  markers: any[];
  onMapClick?: (e: any) => void;
  showLabels?: boolean;
  showMarkerLabels?: boolean;
  interactive?: boolean;
}

const GameMap = forwardRef<MapRef, GameMapProps>((props, ref) => (
  <MapComponent
    ref={ref}
    key={props.mapKey}
    markers={props.markers}
    onMapClick={props.onMapClick}
    showLabels={props.showLabels}
    showMarkerLabels={props.showMarkerLabels}
    interactive={props.interactive}
  />
));

GameMap.displayName = 'GameMap';

export default GameMap;