import React, { useState, useRef, useCallback, useMemo } from 'react';
import { User, Bot, Wrench, Database, Globe, Plus } from 'lucide-react';

// Initial node positions
const INITIAL_NODES = [
    { id: 'client', label: 'Client', Icon: User, type: 'client', x: 80, y: 200, color: 'flowpay' },
    { id: 'agent-a', label: 'Agent A', Icon: Bot, type: 'agent', x: 280, y: 120, color: 'accent', margin: 10 },
    { id: 'agent-b', label: 'Agent B', Icon: Bot, type: 'agent', x: 280, y: 280, color: 'accent', margin: 5 },
    { id: 'service-a', label: 'API Service', Icon: Wrench, type: 'service', x: 480, y: 120, color: 'success' },
    { id: 'service-b', label: 'Data Service', Icon: Database, type: 'service', x: 480, y: 280, color: 'success' },
];

const INITIAL_EDGES = [
    { id: 'e1', source: 'client', target: 'agent-a', streamId: '#101', flowRate: 0.005 },
    { id: 'e2', source: 'client', target: 'agent-b', streamId: '#102', flowRate: 0.003 },
    { id: 'e3', source: 'agent-a', target: 'service-a', streamId: '#103', flowRate: 0.0045 },
    { id: 'e4', source: 'agent-b', target: 'service-b', streamId: '#104', flowRate: 0.0028 },
];

// Node Component
const GraphNode = ({ node, isSelected, onSelect, onDragStart, isDragging }) => {
    const colors = {
        flowpay: 'from-flowpay-500 to-flowpay-600 border-flowpay-400 shadow-glow',
        accent: 'from-accent-500 to-accent-600 border-accent-400 shadow-glow-accent',
        success: 'from-success-500 to-success-600 border-success-400 shadow-glow-success',
    };

    const NodeIcon = node.Icon;

    return (
        <g
            transform={`translate(${node.x}, ${node.y})`}
            onMouseDown={(e) => onDragStart(e, node.id)}
            onClick={() => onSelect(node.id)}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            className="transition-transform duration-100"
        >
            {/* Glow effect */}
            <circle
                r="35"
                fill="none"
                stroke={isSelected ? '#3b82f6' : 'transparent'}
                strokeWidth="3"
                className={isSelected ? 'animate-pulse' : ''}
            />

            {/* Node circle */}
            <circle
                r="30"
                className={`fill-current ${colors[node.color]?.includes('flowpay') ? 'text-flowpay-500' :
                    colors[node.color]?.includes('accent') ? 'text-accent-500' : 'text-success-500'}`}
                stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
            />

            {/* Icon - using foreignObject for React components */}
            <foreignObject x="-10" y="-10" width="20" height="20">
                <div className="flex items-center justify-center w-full h-full">
                    <NodeIcon className="w-5 h-5 text-white" />
                </div>
            </foreignObject>

            {/* Label */}
            <text textAnchor="middle" dy="50" fill="white" fontSize="12" fontWeight="600">
                {node.label}
            </text>

            {/* Margin badge for agents */}
            {node.margin && (
                <g transform="translate(20, -25)">
                    <rect x="-18" y="-10" width="36" height="16" rx="8" fill="#a855f7" fillOpacity="0.8" />
                    <text textAnchor="middle" dy="3" fill="white" fontSize="9" fontWeight="bold">+{node.margin}%</text>
                </g>
            )}
        </g>
    );
};

// Edge Component with animated flow
const GraphEdge = ({ edge, sourceNode, targetNode }) => {
    const x1 = sourceNode.x + 30;
    const y1 = sourceNode.y;
    const x2 = targetNode.x - 30;
    const y2 = targetNode.y;

    // Calculate midpoint for label
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - 15;

    // Generate unique gradient ID
    const gradientId = `gradient-${edge.id}`;

    return (
        <g>
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
            </defs>

            {/* Edge line */}
            <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={`url(#${gradientId})`}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
            />

            {/* Animated flow particles */}
            {[0, 1, 2].map(i => (
                <circle
                    key={i}
                    r="4"
                    fill="#3b82f6"
                    opacity="0.8"
                >
                    <animateMotion
                        dur={`${1.5 + i * 0.3}s`}
                        repeatCount="indefinite"
                        path={`M${x1},${y1} L${x2},${y2}`}
                        begin={`${i * 0.5}s`}
                    />
                </circle>
            ))}

            {/* Stream ID label */}
            <g transform={`translate(${midX}, ${midY})`}>
                <rect x="-25" y="-8" width="50" height="16" rx="4" fill="rgba(0,0,0,0.5)" />
                <text textAnchor="middle" dy="4" fill="white" fontSize="9" opacity="0.8">
                    {edge.streamId}
                </text>
            </g>
        </g>
    );
};

// Node Details Panel
const NodeDetails = ({ node, onClose, onMarginChange }) => {
    if (!node) return null;

    const NodeIcon = node.Icon;

    return (
        <div className="absolute top-4 right-4 w-64 glass rounded-xl p-4 animate-slide-down z-20">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <NodeIcon className="w-6 h-6 text-white/80" />
                    <span className="font-semibold text-white">{node.label}</span>
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-white/50">Type</span>
                    <span className="text-white capitalize">{node.type}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/50">Status</span>
                    <span className="chip-success">● Active</span>
                </div>

                {node.type === 'agent' && (
                    <div>
                        <label className="text-white/50 block mb-1">Margin (%)</label>
                        <input
                            type="number"
                            value={node.margin || 0}
                            onChange={(e) => onMarginChange(node.id, parseInt(e.target.value))}
                            className="input-default py-1.5 text-sm"
                            min="0"
                            max="50"
                        />
                    </div>
                )}

                <div className="pt-3 border-t border-white/10">
                    <div className="text-white/50 mb-1">Connections</div>
                    <div className="text-white">3 incoming, 2 outgoing</div>
                </div>
            </div>
        </div>
    );
};

// Metrics Panel
const MetricsPanel = ({ nodes, edges }) => {
    const totalThroughput = edges.reduce((sum, e) => sum + e.flowRate, 0);
    const activeAgents = nodes.filter(n => n.type === 'agent').length;
    const activeServices = nodes.filter(n => n.type === 'service').length;

    return (
        <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4 z-10">
            <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                    <div className="text-xl font-bold text-flowpay-400">{nodes.length}</div>
                    <div className="text-xs text-white/50">Total Nodes</div>
                </div>
                <div>
                    <div className="text-xl font-bold text-accent-400">{activeAgents}</div>
                    <div className="text-xs text-white/50">Agents</div>
                </div>
                <div>
                    <div className="text-xl font-bold text-success-400">{activeServices}</div>
                    <div className="text-xs text-white/50">Services</div>
                </div>
                <div>
                    <div className="text-xl font-bold text-warning-400">{totalThroughput.toFixed(4)}</div>
                    <div className="text-xs text-white/50">Total Flow/s</div>
                </div>
            </div>
        </div>
    );
};

// Zoom Controls
const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onReset }) => (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <button onClick={onZoomIn} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white hover:bg-white/10">+</button>
        <button onClick={onZoomOut} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white hover:bg-white/10">−</button>
        <button onClick={onReset} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white hover:bg-white/10 text-xs">⟲</button>
        <div className="text-xs text-white/40 text-center">{Math.round(zoom * 100)}%</div>
    </div>
);

// Add Connection Modal
const AddConnectionModal = ({ isOpen, nodes, onAdd, onClose }) => {
    const [source, setSource] = useState('');
    const [target, setTarget] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass rounded-2xl p-6 w-80 animate-scale-in">
                <h3 className="text-lg font-bold text-white mb-4">Add Connection</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm text-white/60">Source</label>
                        <select value={source} onChange={(e) => setSource(e.target.value)} className="input-default w-full mt-1">
                            <option value="">Select...</option>
                            {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-white/60">Target</label>
                        <select value={target} onChange={(e) => setTarget(e.target.value)} className="input-default w-full mt-1">
                            <option value="">Select...</option>
                            {nodes.filter(n => n.id !== source).map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 mt-6">
                    <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
                    <button onClick={() => onAdd(source, target)} className="btn-primary flex-1" disabled={!source || !target}>Add</button>
                </div>
            </div>
        </div>
    );
};

export function ServiceGraph() {
    const [nodes, setNodes] = useState(INITIAL_NODES);
    const [edges, setEdges] = useState(INITIAL_EDGES);
    const [selectedNode, setSelectedNode] = useState(null);
    const [draggingNode, setDraggingNode] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [showAddModal, setShowAddModal] = useState(false);
    const svgRef = useRef(null);

    // Handle node drag
    const handleDragStart = useCallback((e, nodeId) => {
        e.stopPropagation();
        setDraggingNode(nodeId);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!draggingNode || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;

        setNodes(prev => prev.map(n =>
            n.id === draggingNode ? { ...n, x, y } : n
        ));
    }, [draggingNode, pan, zoom]);

    const handleMouseUp = useCallback(() => {
        setDraggingNode(null);
    }, []);

    // Zoom controls
    const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
    const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

    // Update margin
    const handleMarginChange = (nodeId, margin) => {
        setNodes(prev => prev.map(n =>
            n.id === nodeId ? { ...n, margin } : n
        ));
    };

    // Add new connection
    const handleAddConnection = (source, target) => {
        const newEdge = {
            id: `e${edges.length + 1}`,
            source,
            target,
            streamId: `#${100 + edges.length + 1}`,
            flowRate: 0.002,
        };
        setEdges([...edges, newEdge]);
        setShowAddModal(false);
    };

    // Get selected node details
    const selectedNodeData = useMemo(() =>
        nodes.find(n => n.id === selectedNode), [nodes, selectedNode]);

    return (
        <div className="card-glass p-6 h-full relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5" /> Service Mesh Topology
                    <span className="chip-primary">{edges.length} streams</span>
                </h2>
                <button onClick={() => setShowAddModal(true)} className="btn-outline text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Connection
                </button>
            </div>

            {/* Graph Canvas */}
            <div className="relative h-80 rounded-xl bg-surface-800/50 border border-white/10 overflow-hidden">
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ cursor: draggingNode ? 'grabbing' : 'default' }}
                >
                    <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                        {/* Render edges */}
                        {edges.map(edge => {
                            const source = nodes.find(n => n.id === edge.source);
                            const target = nodes.find(n => n.id === edge.target);
                            if (!source || !target) return null;
                            return <GraphEdge key={edge.id} edge={edge} sourceNode={source} targetNode={target} />;
                        })}

                        {/* Render nodes */}
                        {nodes.map(node => (
                            <GraphNode
                                key={node.id}
                                node={node}
                                isSelected={selectedNode === node.id}
                                onSelect={setSelectedNode}
                                onDragStart={handleDragStart}
                                isDragging={draggingNode === node.id}
                            />
                        ))}
                    </g>
                </svg>

                {/* Controls */}
                <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} />

                {/* Node Details */}
                <NodeDetails
                    node={selectedNodeData}
                    onClose={() => setSelectedNode(null)}
                    onMarginChange={handleMarginChange}
                />

                {/* Metrics */}
                <MetricsPanel nodes={nodes} edges={edges} />
            </div>

            {/* Add Connection Modal */}
            <AddConnectionModal
                isOpen={showAddModal}
                nodes={nodes}
                onAdd={handleAddConnection}
                onClose={() => setShowAddModal(false)}
            />
        </div>
    );
}
