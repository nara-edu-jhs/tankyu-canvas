import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  useReactFlow, // 新しく追加
  getRectOfNodes, // 新しく追加
} from 'reactflow';
import 'reactflow/dist/style.css';

// --- 1. カスタムカード（ノード）の定義 ---
// (SourceNode, EvidenceNode, ThoughtNode は既存のまま)
const SourceNode = ({ id, data, isConnectable }) => {
  return (
    <div style={{
      background: '#e6f4ea', border: '2px solid #137333', borderRadius: '8px',
      padding: '12px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cursor: 'move' // 追加
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ background: '#137333', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
          出典・文献
        </span>
        <button onClick={() => data.onDelete?.(id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5f6368', fontWeight: 'bold' }}>✕</button>
      </div>
      
      <select 
        value={data.type || 'Webサイト'} 
        onChange={(e) => data.onChange?.(id, 'type', e.target.value)}
        style={{ width: '100%', marginBottom: '6px', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0' }}
      >
        <option value="Webサイト">Webサイト</option>
        <option value="本・新聞">本・新聞</option>
        <option value="実験・アンケート">実験・アンケート</option>
        <option value="その他">その他</option>
      </select>

      <input 
        type="text" 
        placeholder="タイトル（例: 〇〇新聞の記事）" 
        value={data.title || ''} 
        onChange={(e) => data.onChange?.(id, 'title', e.target.value)}
        style={{ width: '95%', marginBottom: '6px', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }}
      />
      
      <input 
        type="text" 
        placeholder="URLや著者の名前" 
        value={data.detail || ''} 
        onChange={(e) => data.onChange?.(id, 'detail', e.target.value)}
        style={{ width: '95%', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0', boxSizing: 'border-box' }}
      />
      
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} id="source-right" style={{ background: '#137333', width: '10px', height: '10px' }} />
    </div>
  );
};

const EvidenceNode = ({ id, data, isConnectable }) => {
  return (
    <div style={{
      background: '#e8f0fe', border: '2px solid #1a73e8', borderRadius: '8px',
      padding: '12px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cursor: 'move'
    }}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} id="evidence-left" style={{ background: '#1a73e8', width: '10px', height: '10px' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ background: '#1a73e8', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
          根拠資料・引用
        </span>
        <button onClick={() => data.onDelete?.(id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5f6368', fontWeight: 'bold' }}>✕</button>
      </div>

      <textarea 
        placeholder="書いてあった「事実」だけを書こう！" 
        value={data.text || ''} 
        onChange={(e) => data.onChange?.(id, 'text', e.target.value)}
        rows={3}
        style={{ width: '95%', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0', resize: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' }}
      />

      <span style={{ fontSize: '10px', color: '#1a73e8', display: 'block', marginTop: '4px' }}>※自分の意見はここに入れません</span>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} id="evidence-right" style={{ background: '#1a73e8', width: '10px', height: '10px' }} />
    </div>
  );
};

const ThoughtNode = ({ id, data, isConnectable }) => {
  return (
    <div style={{
      background: '#fce8e6', border: '2px solid #d93025', borderRadius: '8px',
      padding: '12px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cursor: 'move'
    }}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} id="thought-left" style={{ background: '#d93025', width: '10px', height: '10px' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ background: '#d93025', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
          自分の考え
        </span>
        <button onClick={() => data.onDelete?.(id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#5f6368', fontWeight: 'bold' }}>✕</button>
      </div>

      <select 
        value={data.type || '問い・疑問'} 
        onChange={(e) => data.onChange?.(id, 'type', e.target.value)}
        style={{ width: '100%', marginBottom: '6px', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0' }}
      >
        <option value="問い・疑問">問い・疑問</option>
        <option value="自分の予想">自分の予想</option>
        <option value="分析・考察">分析・考察</option>
        <option value="結論">結論</option>
      </select>

      <textarea 
        placeholder="〜だから、◯◯なのでのではないかと考えた。" 
        value={data.text || ''} 
        onChange={(e) => data.onChange?.(id, 'text', e.target.value)}
        rows={3}
        style={{ width: '95%', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0', resize: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' }}
      />
    </div>
  );
};


// ✒️ 【新設】手書きノード（Pathを表示するだけの透明なノード）
const DrawingNode = ({ id, data }) => {
  return (
    <svg style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible' }}>
      <path
        d={data.path || ''}
        stroke={data.stroke || '#000'}
        strokeWidth={data.strokeWidth || 1}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const nodeTypes = {
  sourceNode: SourceNode,
  evidenceNode: EvidenceNode,
  thoughtNode: ThoughtNode,
  drawingNode: DrawingNode, // 追加
};


// 🛠️ 【新設】ペンツールバーコンポーネント
const PenToolbar = ({ activeTool, setActiveTool, penColor, setPenColor, penWidth, setPenWidth }) => {
  const colors = ['#000000', '#d93025', '#1a73e8', '#137333', '#fbc02d']; // 黒、赤、青、緑、黄

  return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      background: 'white', padding: '10px', borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', gap: '10px', alignItems: 'center', zIndex: 1000
    }}>
      {/* 色の選択 */}
      {colors.map(color => (
        <button
          key={color}
          onClick={() => setPenColor(color)}
          style={{
            width: '24px', height: '24px', borderRadius: '50%', background: color, border: penColor === color ? '2px solid black' : '1px solid #ccc', cursor: 'pointer'
          }}
        />
      ))}
      
      <div style={{ width: '1px', height: '20px', background: '#ccc' }}></div>

      {/* ツール選択 */}
      <button onClick={() => {setActiveTool('pencil'); setPenWidth(1);}} style={{ background: activeTool === 'pencil' ? '#eee' : 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>鉛筆</button>
      <button onClick={() => {setActiveTool('magic'); setPenWidth(3);}} style={{ background: activeTool === 'magic' ? '#eee' : 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>マジック</button>
      <button onClick={() => setActiveTool('eraser')} style={{ background: activeTool === 'eraser' ? '#eee' : 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>消しゴム</button>

    </div>
  );
};


// --- 2. メインコンポーネント ---

// ReactFlowProvider で囲む必要があるため、内部コンポーネントとして定義
const FlowCanvas = ({ nodes, setNodes, edges, setEdges, fileInputRef, onNodesChange, onEdgesChange, bindNodeFunctions }) => {
  const reactFlowInstance = useReactFlow();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [activeTool, setActiveTool] = useState('pencil'); // pencil, magic, eraser
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(1);
  const drawingCanvasRef = useRef(null);

  // カードを削除（消しゴムツール用）
  const handleNodeDelete = useCallback((id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  }, [setNodes, setEdges]);

  // マウスイベントをReactFlowのキャンバス座標に変換
  const getCanvasPoint = (event) => {
    const reactFlowBounds = reactFlowInstance.getPane().getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    return position;
  };

  // 手書き開始
  const onMouseDown = useCallback((event) => {
    if (activeTool === 'eraser') {
      const node = event.target.closest('.react-flow__node');
      if (node) {
        handleNodeDelete(node.dataset.id);
      }
      return;
    }
    
    // 他のツールの場合、React Flowのドラッグを無効化
    reactFlowInstance.getPane().classList.add('react-flow__pane--nodrag');
    
    setIsDrawing(true);
    const pos = getCanvasPoint(event);
    setCurrentPath(`M ${pos.x} ${pos.y}`);
  }, [activeTool, handleNodeDelete, reactFlowInstance]);

  // 手書き中
  const onMouseMove = useCallback((event) => {
    if (!isDrawing) return;
    const pos = getCanvasPoint(event);
    setCurrentPath((path) => `${path} L ${pos.x} ${pos.y}`);
  }, [isDrawing]);

  // 手書き終了
  const onMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    reactFlowInstance.getPane().classList.remove('react-flow__pane--nodrag');

    // DrawingNodeを生成して追加
    const id = `drawing-${Date.now()}`;
    const newNode = {
      id,
      type: 'drawingNode',
      position: { x: 0, y: 0 }, // path内で相対座標を指定するため、0,0に配置
      data: {
        path: currentPath,
        stroke: penColor,
        strokeWidth: penWidth,
      },
      style: { zIndex: -10 }, // カードの下に表示
    };
    setNodes((nds) => nds.concat(newNode));
    setCurrentPath('');
  }, [isDrawing, currentPath, penColor, penWidth, setNodes, reactFlowInstance]);

  useEffect(() => {
    const pane = reactFlowInstance.getPane();
    pane.addEventListener('mousedown', onMouseDown);
    pane.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      pane.removeEventListener('mousedown', onMouseDown);
      pane.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseDown, onMouseMove, onMouseUp, reactFlowInstance]);

  return (
    <div style={{ flexGrow: 1, position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={16} size={1} />
      </ReactFlow>

      {/* 手書き用透明レイヤー */}
      <svg
        ref={drawingCanvasRef}
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: isDrawing || activeTool === 'eraser' ? 'auto' : 'none', zIndex: 10
        }}
      >
        {isDrawing && currentPath && (
          <path
            d={currentPath}
            stroke={penColor}
            strokeWidth={penWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      
      <PenToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        penColor={penColor}
        setPenColor={setPenColor}
        penWidth={penWidth}
        setPenWidth={setPenWidth}
      />
    </div>
  );
};


export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const fileInputRef = useRef(null);

  // (handleNodeDataChange, handleNodeDelete, bindNodeFunctions, LocalStorage 保存/読み込み、JSONダウンロード/読み込みは既存のまま)

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      {/* (ヘッダーコンポーネントは既存のまま) */}
      
      <ReactFlowProvider>
        <FlowCanvas
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          fileInputRef={fileInputRef}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          bindNodeFunctions={bindNodeFunctions}
        />
      </ReactFlowProvider>
    </div>
  );
}
