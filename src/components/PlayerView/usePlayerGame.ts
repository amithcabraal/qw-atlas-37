import { useState, useEffect, useRef } from 'react';
import { MapLayerMouseEvent } from 'react-map-gl';
import { supabase } from '../../lib/supabase';
import { calculateDistance } from '../../lib/utils';
import type { MapRef } from '../../types/map';

interface UsePlayerGameProps {
  gameId: string;
  playerId: string;
  question: Question;
  questionNumber: number;
  initialHasAnswered: boolean;
  gameStatus: string;
}

export function usePlayerGame({
  gameId,
  playerId,
  question,
  questionNumber,
  initialHasAnswered,
  gameStatus
}: UsePlayerGameProps) {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(initialHasAnswered);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [isRevealing, setIsRevealing] = useState(gameStatus === 'revealing');
  const [currentQuestionId, setCurrentQuestionId] = useState(question.id);
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (gameStatus === 'playing') {
      setSelectedLocation(null);
      setError(null);
      setHasAnswered(false);
      setAnswers([]);
      setIsRevealing(false);
      setIsSubmitting(false);
      setMapKey(prev => prev + 1);
    } else if (gameStatus === 'revealing') {
      setIsRevealing(true);
      fetchAnswers();
    }
  }, [gameStatus]);

  useEffect(() => {
    const resetView = async () => {
      if (question.id !== currentQuestionId) {
        setCurrentQuestionId(question.id);
        setSelectedLocation(null);
        setError(null);
        setHasAnswered(false);
        setAnswers([]);
        setIsRevealing(false);
        setIsSubmitting(false);
        setMapKey(prev => prev + 1);

        if (mapRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          mapRef.current.flyTo({
            zoom: 0,
            duration: 1000
          });
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          mapRef.current.flyTo({
            center: [0, 20],
            zoom: 1.5,
            duration: 1000
          });
        }
      }
    };

    resetView();
  }, [question.id, currentQuestionId]);

  const fetchAnswers = async () => {
    try {
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('game_id', gameId)
        .eq('question_id', questionNumber);

      if (answersError) throw answersError;

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, initials')
        .eq('game_id', gameId);

      if (playersError) throw playersError;

      if (playersData) {
        const playersMap = playersData.reduce((acc, player) => ({
          ...acc,
          [player.id]: player
        }), {});
        setPlayers(playersMap);
      }

      if (answersData) {
        setAnswers(answersData);
        
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [question.longitude, question.latitude],
            zoom: 3,
            duration: 2000
          });
        }
      }
    } catch (err) {
      console.error('Error fetching answers:', err);
    }
  };

  const handleMapClick = (e: MapLayerMouseEvent) => {
    if (gameStatus !== 'playing' || hasAnswered || isSubmitting) return;
    
    const lng = e.lngLat?.lng;
    const lat = e.lngLat?.lat;
    
    if (typeof lng === 'number' && typeof lat === 'number') {
      setSelectedLocation([lng, lat]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLocation || hasAnswered || isSubmitting || gameStatus !== 'playing') return;

    try {
      setIsSubmitting(true);
      setError(null);
      const [longitude, latitude] = selectedLocation;

      const distance = calculateDistance(
        latitude,
        longitude,
        question.latitude,
        question.longitude
      );

      const score = Math.max(0, Math.floor(1000 * Math.exp(-distance / 1000)));

      const { data: playerData, error: fetchError } = await supabase
        .from('players')
        .select('score')
        .eq('id', playerId)
        .single();

      if (fetchError) throw fetchError;

      const { error: answerError } = await supabase
        .from('answers')
        .insert({
          player_id: playerId,
          game_id: gameId,
          question_id: questionNumber,
          latitude,
          longitude,
          distance,
          score
        });

      if (answerError) throw answerError;

      const { error: playerError } = await supabase
        .from('players')
        .update({ 
          has_answered: true,
          score: (playerData?.score || 0) + score
        })
        .eq('id', playerId);

      if (playerError) throw playerError;
      
      setHasAnswered(true);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const markers = isRevealing ? [
    { 
      latitude: question.latitude, 
      longitude: question.longitude, 
      color: 'text-green-500',
      fill: true,
      label: 'Correct Location'
    },
    ...answers.map(answer => ({
      latitude: answer.latitude,
      longitude: answer.longitude,
      color: answer.player_id === playerId ? 'text-blue-500' : 'text-red-500',
      fill: true,
      label: `${players[answer.player_id]?.initials || 'Unknown'} (${answer.score} pts)`
    }))
  ] : selectedLocation ? [{ 
    longitude: selectedLocation[0], 
    latitude: selectedLocation[1],
    color: 'text-blue-500',
    fill: true
  }] : [];

  return {
    selectedLocation,
    isSubmitting,
    error,
    hasAnswered,
    markers,
    mapRef,
    mapKey,
    handleMapClick,
    handleSubmit
  };
}