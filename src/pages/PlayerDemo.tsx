import React from 'react';
import PlayerDemoView from '../components/PlayerDemoView';
import { questions } from '../data/questions';

export default function PlayerDemo() {
  // Use the first question as a demo
  const demoQuestion = questions[0];
  
  return (
    <PlayerDemoView
      question={demoQuestion}
      questionNumber={0}
    />
  );
}