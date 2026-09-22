import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles, Plus, Trash2, Link2, RefreshCw, ZoomIn, ZoomOut,
  Maximize2, ArrowRight, ShieldCheck, Check, Layers, Move,
  Info, Sliders, Play, X
} from "lucide-react";
import { FOODS } from "../../data/materials";

// Initial brainstorm tree generator based on chosen food
function generateTreeForFood(foodName) {
  const lower = foodName.toLowerCase();

  if (lower.includes("juice") || lower.includes("beverage")) {
    return {
      root: { id: "root", title: foodName.toUpperCase(), subtitle: "Liquid · Cold Chain", x: 450, y: 50, type: "root" },
      formats: [
        { id: "f-pet", parentId: "root", title: "PET Bottle", subtitle: "Rigid Polymer", tag: "Low Cost", x: 180, y: 190, type: "format" },
        { id: "f-glass", parentId: "root", title: "Glass Bottle", subtitle: "Inorganic Silica", tag: "Premium", x: 450, y: 190, type: "format" },
        { id: "f-carton", parentId: "root", title: "Aseptic Carton", subtitle: "Multi-ply Board", tag: "Ambient", x: 720, y: 190, type: "format" }
      ],
      attributes: [
        { id: "a-pet", parentId: "f-pet", title: "Tensile Strength", subtitle: "Shatter-Resistant", tag: "Durable", x: 180, y: 330, type: "attribute" },
        { id: "a-glass", parentId: "f-glass", title: "Zero Leaching", subtitle: "Chemically Inert", tag: "Pure", x: 450, y: 330, type: "attribute" },
        { id: "a-carton", parentId: "f-carton", title: "Light Shield", subtitle: "Aseptic Foil Core", tag: "No Chill", x: 720, y: 330, type: "attribute" }
      ],
      outcomes: [
        { id: "o-pet", parentId: "a-pet", title: "Medium Barrier", subtitle: "OTR 35 cc · RIC 1", tag: "30-Day Shelf", x: 180, y: 470, type: "outcome" },
        { id: "o-glass", parentId: "a-glass", title: "Absolute Barrier", subtitle: "OTR 0.00 cc · Glass", tag: "Fragile", x: 450, y: 470, type: "outcome" },
        { id: "o-carton", parentId: "a-carton", title: "High Barrier", subtitle: "OTR 0.1 cc · Pulp", tag: "Cube Saving", x: 720, y: 470, type: "outcome" }
      ]
    };
  } else if (lower.includes("produce") || lower.includes("tomato") || lower.includes("fruit")) {
    return {
      root: { id: "root", title: foodName.toUpperCase(), subtitle: "Respiration · High RH", x: 450, y: 50, type: "root" },
      formats: [
        { id: "f-perf", parentId: "root", title: "Laser-Perf Film", subtitle: "Micro-Porous BOPP", tag: "EMAP", x: 180, y: 190, type: "format" },
        { id: "f-clamshell", parentId: "root", title: "Vented Clamshell", subtitle: "rPET Punched Tray", tag: "Display", x: 450, y: 190, type: "format" },
        { id: "f-pulp", parentId: "root", title: "Molded Fiber Tray", subtitle: "Cellulose Pulp", tag: "Plastic-Free", x: 720, y: 190, type: "format" }
      ],
      attributes: [
        { id: "a-perf", parentId: "f-perf", title: "O₂ Influx Match", subtitle: "Equilibrium Flux", tag: "Anti-Hypoxia", x: 180, y: 330, type: "attribute" },
        { id: "a-clamshell", parentId: "f-clamshell", title: "Impact Shield", subtitle: "Crush Protection", tag: "Rigid", x: 450, y: 330, type: "attribute" },
        { id: "a-pulp", parentId: "f-pulp", title: "Moisture Buffer", subtitle: "Condensation Trap", tag: "Bio-Based", x: 720, y: 330, type: "attribute" }
      ],
      outcomes: [
        { id: "o-perf", parentId: "a-perf", title: "Extended Freshness", subtitle: "+8 Days Longevity", tag: "Grade A MAP", x: 180, y: 470, type: "outcome" },
        { id: "o-clamshell", parentId: "a-clamshell", title: "Clear Protection", subtitle: "Curbside Recycled", tag: "Crush Proof", x: 450, y: 470, type: "outcome" },
        { id: "o-pulp", parentId: "a-pulp", title: "Circular Stream", subtitle: "60-Day Degradable", tag: "Renewable", x: 720, y: 470, type: "outcome" }
      ]
    };
  } else {
    // Standard dry / snack / commodity defaults
    return {
      root: { id: "root", title: foodName.toUpperCase(), subtitle: "Low Moisture · Snacks", x: 450, y: 50, type: "root" },
      formats: [
        { id: "f-met", parentId: "root", title: "Metallized Pouch", subtitle: "BOPP / Met-PET", tag: "Economical", x: 180, y: 190, type: "format" },
        { id: "f-alu", parentId: "root", title: "Alu Tri-Laminate", subtitle: "PET / Alu / PE", tag: "Long Life", x: 450, y: 190, type: "format" },
        { id: "f-evoh", parentId: "root", title: "Mono-PE / EVOH", subtitle: "Circular Barrier", tag: "Recyclable", x: 720, y: 190, type: "format" }
      ],
      attributes: [
        { id: "a-met", parentId: "f-met", title: "Vapor Deposition", subtitle: "Sub-Micron Aluminum", tag: "Flexible", x: 180, y: 330, type: "attribute" },
        { id: "a-alu", parentId: "f-alu", title: "True Foil Shield", subtitle: "Zero O₂ & Light", tag: "Hermetic", x: 450, y: 330, type: "attribute" },
        { id: "a-evoh", parentId: "f-evoh", title: "Mono-Material PE", subtitle: "Recycling Stream 4", tag: "Eco Design", x: 720, y: 330, type: "attribute" }
      ],
      outcomes: [
        { id: "o-met", parentId: "a-met", title: "Medium Barrier", subtitle: "OTR 1.5 · WVTR 0.6", tag: "Low Cost", x: 180, y: 470, type: "outcome" },
        { id: "o-alu", parentId: "a-alu", title: "Maximum Barrier", subtitle: "OTR 0.05 · Foil", tag: "365-Day Life", x: 450, y: 470, type: "outcome" },
        { id: "o-evoh", parentId: "a-evoh", title: "Circular Barrier", subtitle: "OTR 2.2 · EVOH", tag: "Recyclable", x: 720, y: 470, type: "outcome" }
      ]
    };
  }
}

export function PackagingBrainstorm({ onNavigate, onSendToWorkbench }) {
  const [foodQuery, setFoodQuery] = useState("Fresh Juice");
  const [nodes, setNodes] = useState([]);
  const [customLinks, setCustomLinks] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [linkSourceNodeId, setLinkSourceNodeId] = useState(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [comparisonNodes, setComparisonNodes] = useState([]);

  const svgRef = useRef(null);

  // Initialize tree on first load or food query change
  useEffect(() => {
    const tree = generateTreeForFood(foodQuery);
    const all = [
      tree.root,
      ...tree.formats,
      ...tree.attributes,
      ...tree.outcomes
    ];
    setNodes(all);
    setCustomLinks([]);
    setSelectedNodeId(tree.formats[0].id);
    setComparisonNodes([tree.formats[0].id, tree.formats[1].id]);
  }, [foodQuery]);

  // Handle Dragging
  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    if (linkSourceNodeId) {
      // Create link between linkSourceNodeId and id
      if (linkSourceNodeId !== id) {
        setCustomLinks(prev => [...prev, { from: linkSourceNodeId, to: id, id: `${linkSourceNodeId}->${id}` }]);
      }
      setLinkSourceNodeId(null);
      return;
    }

    const node = nodes.find(n => n.id === id);
    if (!node) return;

    setSelectedNodeId(id);
    setDraggingNodeId(id);

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId || !svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    setNodes(prev => prev.map(n => {
      if (n.id === draggingNodeId) {
        return {
          ...n,
          x: Math.max(80, Math.min(840, mouseX - dragOffset.x)),
          y: Math.max(30, Math.min(540, mouseY - dragOffset.y))
        };
      }
      return n;
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Add Alternative Node to active selected parent
  const handleAddAlternative = () => {
    const targetParent = nodes.find(n => n.id === selectedNodeId) || nodes[0];
    const newId = `node-${Date.now()}`;
    const newNode = {
      id: newId,
      parentId: targetParent.id,
      title: "New Alternative Idea",
      subtitle: "Custom Substrate Hypothesis",
      tag: "Experimental",
      x: Math.min(780, targetParent.x + (Math.random() > 0.5 ? 120 : -120)),
      y: Math.min(520, targetParent.y + 110),
      type: "format"
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newId);
  };

  // Remove active node
  const handleRemoveNode = (id) => {
    if (id === "root") return; // Keep root
    setNodes(prev => prev.filter(n => n.id !== id && n.parentId !== id));
    setCustomLinks(prev => prev.filter(l => l.from !== id && l.to !== id));
    if (selectedNodeId === id) setSelectedNodeId("root");
  };

  // Toggle comparison selection
  const handleToggleCompare = (id) => {
    if (comparisonNodes.includes(id)) {
      setComparisonNodes(prev => prev.filter(x => x !== id));
    } else {
      if (comparisonNodes.length < 3) {
        setComparisonNodes(prev => [...prev, id]);
      }
    }
  };

  // Reset to tidy hierarchical layout
  const handleResetLayout = () => {
    const tree = generateTreeForFood(foodQuery);
    setNodes([
      tree.root,
      ...tree.formats,
      ...tree.attributes,
      ...tree.outcomes
    ]);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Compute connecting line paths
  const allEdges = useMemo(() => {
    const edges = [];
    nodes.forEach(child => {
      if (child.parentId) {
        const parent = nodes.find(p => p.id === child.parentId);
        if (parent) {
          edges.push({
            id: `${parent.id}->${child.id}`,
            fromX: parent.x,
            fromY: parent.y + 24,
            toX: child.x,
            toY: child.y - 24,
            type: "tree"
          });
        }
      }
    });

    customLinks.forEach(l => {
      const parent = nodes.find(p => p.id === l.from);
      const child = nodes.find(c => c.id === l.to);
      if (parent && child) {
        edges.push({
          id: l.id,
          fromX: parent.x,
          fromY: parent.y + 24,
          toX: child.x,
          toY: child.y - 24,
          type: "custom"
        });
      }
    });

    return edges;
  }, [nodes, customLinks]);

  return (
    <div className="brainstorm-container">
      {/* Top Header & Search Bar */}
      <div className="brainstorm-header">
        <div>
          <div className="spec-tag green">
            <Layers size={12} /> Interactive Engineering Whiteboard
          </div>
          <h1 className="brainstorm-title">Packaging Brainstorm Canvas</h1>
          <p className="brainstorm-subhead">
            Visually expand food packaging architectures. Drag nodes, connect trade-offs, and compare material hypotheses.
          </p>
        </div>

        {/* Food Product Input Expansion */}
        <div className="brainstorm-food-bar">
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
            Food Product:
          </span>
          <input
            type="text"
            className="brainstorm-food-input"
            value={foodQuery}
            onChange={(e) => setFoodQuery(e.target.value)}
            placeholder="Enter food (e.g. Mango Juice, Biscuits, Fresh Berries)..."
          />
          <button
            className="btn btn-primary"
            style={{ fontSize: "12px", padding: "7px 14px" }}
            onClick={() => handleResetLayout()}
          >
            <Sparkles size={13} /> Expand Tree
          </button>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="brainstorm-toolbar">
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="toolbar-btn"
            onClick={handleAddAlternative}
            title="Add an alternative packaging branch"
          >
            <Plus size={14} /> Add Alternative
          </button>
          <button
            className={`toolbar-btn ${linkSourceNodeId ? "active" : ""}`}
            onClick={() => setLinkSourceNodeId(selectedNodeId)}
            title="Click this, then click another node to create a relationship connection"
          >
            <Link2 size={14} /> {linkSourceNodeId ? "Click target node..." : "Connect Ideas"}
          </button>
          {selectedNodeId && selectedNodeId !== "root" && (
            <button
              className="toolbar-btn danger"
              onClick={() => handleRemoveNode(selectedNodeId)}
              title="Remove selected branch"
            >
              <Trash2 size={14} /> Remove Node
            </button>
          )}
          <button
            className="toolbar-btn"
            onClick={handleResetLayout}
            title="Reset layout to neat hierarchy"
          >
            <RefreshCw size={14} /> Auto-Align
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "12px", color: "var(--text-muted)" }}>
          <span><Move size={12} style={{ display: "inline", marginRight: "4px" }} /> Drag nodes anywhere</span>
          <span>·</span>
          <span><b>{nodes.length}</b> Active Concept Nodes</span>
        </div>
      </div>

      {/* Main Whiteboard Canvas & Side Inspector Layout */}
      <div className="brainstorm-canvas-layout">
        {/* SVG Interactive Canvas */}
        <div
          className="brainstorm-canvas-wrap"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            className="brainstorm-svg-stage"
            viewBox="0 0 920 580"
            width="100%"
            height="580"
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="whiteboard-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="rgba(23, 34, 29, 0.12)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#whiteboard-grid)" />

            {/* Connecting Bezier Edges with Subtle Motion Dashflow */}
            {allEdges.map(edge => {
              const midY = (edge.fromY + edge.toY) / 2;
              const pathData = `M ${edge.fromX} ${edge.fromY} C ${edge.fromX} ${midY}, ${edge.toX} ${midY}, ${edge.toX} ${edge.toY}`;
              const isCustom = edge.type === "custom";

              return (
                <g key={edge.id}>
                  {/* Outer glow/cushion */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    strokeOpacity="0.8"
                  />
                  {/* Main connection stroke */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isCustom ? "#D59A38" : "#3F7658"}
                    strokeWidth={isCustom ? "2" : "2.2"}
                    strokeDasharray={isCustom ? "5 4" : "none"}
                    strokeOpacity="0.8"
                  />
                  {/* Subtle animated motion particles along line */}
                  <circle r="3" fill={isCustom ? "#D59A38" : "#3F7658"}>
                    <animateMotion
                      path={pathData}
                      dur={isCustom ? "4s" : "3s"}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}

            {/* Render Nodes as SVG ForeignObjects or Groups */}
            {nodes.map(n => {
              const isSelected = selectedNodeId === n.id;
              const isComparing = comparisonNodes.includes(n.id);
              const isRoot = n.type === "root";
              const isFormat = n.type === "format";

              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  className="brainstorm-node-group"
                  onMouseDown={(e) => handleMouseDown(e, n.id)}
                  style={{ cursor: "grab" }}
                >
                  {/* Node Background Pill / Card */}
                  <rect
                    x="-90"
                    y="-26"
                    width="180"
                    height="52"
                    rx="8"
                    fill={isRoot ? "#17221D" : isSelected ? "#FBFDFB" : "#FFFFFF"}
                    stroke={isSelected ? "#3F7658" : isComparing ? "#D59A38" : "#DDE4DC"}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    filter="drop-shadow(0 2px 6px rgba(23, 34, 29, 0.08))"
                  />

                  {/* Top tag if present */}
                  {n.tag && (
                    <rect
                      x="-82"
                      y="-36"
                      width={Math.min(100, n.tag.length * 7 + 14)}
                      height="15"
                      rx="3"
                      fill={isRoot ? "#3F7658" : "#E9E2D4"}
                    />
                  )}
                  {n.tag && (
                    <text
                      x="-76"
                      y="-25"
                      fill={isRoot ? "#FFFFFF" : "#17221D"}
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {n.tag}
                    </text>
                  )}

                  {/* Node Title */}
                  <text
                    x="0"
                    y="-4"
                    textAnchor="middle"
                    fill={isRoot ? "#FFFFFF" : "#17221D"}
                    fontSize="12.5"
                    fontWeight="700"
                    fontFamily="var(--font-heading)"
                  >
                    {n.title.length > 20 ? n.title.substring(0, 20) + "…" : n.title}
                  </text>

                  {/* Node Subtitle */}
                  <text
                    x="0"
                    y="13"
                    textAnchor="middle"
                    fill={isRoot ? "#CBD5CC" : "#73847A"}
                    fontSize="10"
                    fontFamily="var(--font-sans)"
                  >
                    {n.subtitle.length > 24 ? n.subtitle.substring(0, 24) + "…" : n.subtitle}
                  </text>

                  {/* Status Ring Anchor dot top & bottom */}
                  <circle cx="0" cy="-26" r="3.5" fill="#3F7658" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="0" cy="26" r="3.5" fill="#3F7658" stroke="#FFFFFF" strokeWidth="1.5" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Inspector & Node Comparison Panel */}
        <div className="brainstorm-inspector">
          <div className="inspector-head">
            <h3>Concept Inspector</h3>
            <small>Active node details & hypothesis verification</small>
          </div>

          {selectedNode ? (
            <div className="inspector-body">
              <div className="inspector-badge">
                {selectedNode.type.toUpperCase()} NODE
              </div>

              <h4 className="inspector-title">{selectedNode.title}</h4>
              <p className="inspector-desc">{selectedNode.subtitle}</p>

              {selectedNode.tag && (
                <div className="inspector-spec-line">
                  <span>Classification Tag</span>
                  <b>{selectedNode.tag}</b>
                </div>
              )}

              <div className="inspector-actions">
                <button
                  className={`btn ${comparisonNodes.includes(selectedNode.id) ? "btn-primary" : "btn-secondary"}`}
                  style={{ width: "100%", fontSize: "12px", marginBottom: "8px" }}
                  onClick={() => handleToggleCompare(selectedNode.id)}
                >
                  {comparisonNodes.includes(selectedNode.id) ? "✓ Added to Comparison" : "+ Add to Side-by-Side Compare"}
                </button>

                {onSendToWorkbench && (
                  <button
                    className="btn btn-outline"
                    style={{ width: "100%", fontSize: "12px" }}
                    onClick={() => onSendToWorkbench(selectedNode)}
                  >
                    Send to Workbench <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: "20px", color: "var(--text-muted)", fontSize: "12.5px" }}>
              Click any node on the whiteboard to inspect barrier metrics and compare alternatives.
            </div>
          )}

          {/* Side-by-Side Comparison Matrix */}
          {comparisonNodes.length >= 2 && (
            <div className="inspector-compare-box">
              <span className="spec-tag green" style={{ marginBottom: "8px", display: "inline-block" }}>
                Multi-Candidate Comparison ({comparisonNodes.length})
              </span>
              <div className="compare-mini-table">
                {comparisonNodes.map(id => {
                  const node = nodes.find(n => n.id === id);
                  if (!node) return null;
                  return (
                    <div key={id} className="compare-mini-item">
                      <b>{node.title}</b>
                      <small>{node.tag || node.subtitle}</small>
                      <button
                        className="compare-remove-btn"
                        onClick={() => handleToggleCompare(id)}
                        title="Remove from comparison"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
