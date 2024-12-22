import React, { useState, useRef } from 'react';
import { MapLayerMouseEvent } from 'react-map-gl';
import GameMap from '../PlayerView/GameMap';
import AnswerControls from '../PlayerView/AnswerControls';
import QuestionCard from '../QuestionCard';
import type { MapRef } from '../../types/map';

interface PlayerDemoViewProps {
  question: any;
  questionNumber: number;
}

export default function PlayerDemoView({
  question,
  questionNumber
}: PlayerDemoViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const handleMapClick = (e: MapLayerMouseEvent) => {
    if (hasAnswered) return;
    
    const lng = e.lngLat?.lng;
    const lat = e.lngLat?.lat;
    
    if (typeof lng === 'number' && typeof lat === 'number') {
      setSelectedLocation([lng, lat]);
    }
  };

  const handleSubmit = () => {
    if (!selectedLocation) return;
    setHasAnswered(true);
  };

  const markers = selectedLocation ? [{
    longitude: selectedLocation[0],
    latitude: selectedLocation[1],
    color: 'text-blue-500',
    fill: true
  }] : [];

  return (
    <div className="fixed top-16 bottom-0 left-0 right-0 flex flex-col">
      {/* Main content area - fills available space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Question card - 35% of remaining space */}
        <div className="h-[35%] p-4">
          <QuestionCard 
            question={question} 
            questionNumber={questionNumber}
          />
        </div>
        
        {/* Map container - 65% of remaining space */}
        <div className="h-[65%]">
          <GameMap
            ref={mapRef}
            mapKey={0}
            markers={markers}
            onMapClick={!hasAnswered ? handleMapClick : undefined}
            showLabels={false}
            showMarkerLabels={false}
            interactive={true}
          />
        </div>
      </div>

      {/* Controls - fixed height at bottom */}
      <div className="h-20 flex-none px-4 py-4 bg-gradient-to-t from-black/50 to-transparent">
        <AnswerControls
          error={null}
          gameStatus="playing"
          hasAnswered={hasAnswered}
          isSubmitting={false}
          selectedLocation={selectedLocation}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}