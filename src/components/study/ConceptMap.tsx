import React, { useState } from 'react';
import type { ConceptMapData } from '../../types/ai.types';
import { motion } from 'framer-motion';
import { Info, Sparkles } from 'lucide-react';

interface ConceptMapProps {
  mapData: ConceptMapData;
}

export const ConceptMap: React.FC<ConceptMapProps> = ({ mapData }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Position nodes radially around a central root concept
  const nodesWithCoords = mapData.nodes.map((node, index) => {
    if (index === 0) {
      // Root Node (Central)
      return { ...node, x: 250, y: 175, isRoot: true };
    }
    
    // Child Nodes (arranged in a circle)
    const childCount = mapData.nodes.length - 1;
    const angle = ((index - 1) * (2 * Math.PI)) / childCount - Math.PI / 2; // offset by -90deg (top start)
    const radiusX = 180;
    const radiusY = 110;
    const x = 250 + radiusX * Math.cos(angle);
    const y = 175 + radiusY * Math.sin(angle);
    
    return { ...node, x, y, isRoot: false };
  });

  const getColorClasses = (color: string, isRoot: boolean) => {
    if (isRoot) {
      return 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent ring-2 ring-indigo-500/20';
    }
    switch (color) {
      case 'violet':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:border-violet-900/60 dark:text-violet-300';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-300';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-300';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-300';
      case 'sky':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:border-sky-900/60 dark:text-sky-300';
      case 'indigo':
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/60 dark:text-indigo-300';
    }
  };

  const activeNode = nodesWithCoords.find((n) => n.id === hoveredNodeId) || nodesWithCoords[0];

  return (
    <div className="w-full bg-white dark:bg-darkSurface border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-850">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-50">{mapData.title || 'AI Concept Map'}</h4>
            <p className="text-[10px] text-gray-500 dark:text-gray-450">Hover over any sub-concept to inspect details</p>
          </div>
        </div>
      </div>

      {/* SVG Canvas wrapper with responsive aspect ratio */}
      <div className="relative w-full aspect-[500/350] bg-gray-50/50 dark:bg-darkBg/30 rounded-2xl border border-gray-100 dark:border-gray-850 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 500 350"
          className="w-full h-full select-none"
        >
          {/* Arrowhead marker definition */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 8 5 L 0 8 z" className="fill-gray-300 dark:fill-gray-700" />
            </marker>
          </defs>

          {/* Render Connections (Edges) */}
          {mapData.edges.map((edge, index) => {
            const fromNode = nodesWithCoords.find((n) => n.id === edge.from);
            const toNode = nodesWithCoords.find((n) => n.id === edge.to);

            if (!fromNode || !toNode) return null;

            // Draw line from boundary to boundary (simple mid-point adjustment)
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            
            // Adjust start and end offsets so arrows don't clip inside the cards
            const offsetStart = fromNode.isRoot ? 40 : 80;
            const offsetEnd = toNode.isRoot ? 45 : 85;

            const startX = fromNode.x + (dx * offsetStart) / len;
            const startY = fromNode.y + (dy * offsetStart) / len;
            const endX = toNode.x - (dx * offsetEnd) / len;
            const endY = toNode.y - (dy * offsetEnd) / len;

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            return (
              <g key={`edge-${index}`} className="group">
                {/* Connection line */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  strokeWidth="1.5"
                  className="stroke-gray-300 dark:stroke-gray-700 transition-colors group-hover:stroke-indigo-400"
                  markerEnd="url(#arrow)"
                />
                
                {/* Edge relationship label */}
                {edge.label && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-35}
                      y={-8}
                      width={70}
                      height={16}
                      rx={8}
                      className="fill-white dark:fill-darkSurface stroke-gray-150 dark:stroke-gray-800"
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[8px] font-bold fill-gray-505 dark:fill-gray-450 tracking-wider uppercase"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodesWithCoords.map((node) => {
            const width = node.isRoot ? 110 : 130;
            const height = node.isRoot ? 44 : 38;
            
            return (
              <g key={node.id}>
                <foreignObject
                  x={node.x - width / 2}
                  y={node.y - height / 2}
                  width={width}
                  height={height}
                  className="overflow-visible"
                >
                  <div
                    className={`w-full h-full flex items-center justify-center px-2 py-1 rounded-xl border text-center text-[10px] font-bold shadow-sm transition-all duration-200 cursor-pointer select-none ${
                      node.id === hoveredNodeId
                        ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-105 shadow-md z-20'
                        : 'hover:scale-103 hover:shadow'
                    } ${getColorClasses(node.color, node.isRoot)}`}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    <span className="line-clamp-2 leading-tight uppercase tracking-wide">
                      {node.label}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Description Info display box */}
      {activeNode && (
        <motion.div
          key={activeNode.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2.5 p-3.5 bg-gray-50 dark:bg-darkBg/60 border border-gray-100 dark:border-gray-850 rounded-2xl"
        >
          <div className="p-1 rounded-lg h-fit bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {activeNode.isRoot ? 'Central Concept' : 'Sub-concept Detail'}
            </span>
            <h5 className="text-xs font-extrabold text-gray-850 dark:text-gray-105 mt-0.5">{activeNode.label}</h5>
            <p className="text-xs text-gray-555 dark:text-gray-400 mt-1 leading-relaxed">{activeNode.description}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
