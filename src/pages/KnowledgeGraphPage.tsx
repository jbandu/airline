import React from 'react';
import { KnowledgeGraph } from '../components/visualizations/KnowledgeGraph';

export const KnowledgeGraphPage: React.FC = () => {
  return (
    <div className="h-full">
      <KnowledgeGraph />
    </div>
  );
};
