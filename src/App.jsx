import React, { useState, useCallback, useEffect, useRef } from 'react';

import ReactFlow, {

  addEdge,

  MiniMap,

  Controls,

  Background,

  useNodesState,

  useEdgesState,

  Handle,

  Position,

} from 'reactflow';

import 'reactflow/dist/style.css';



// --- 1. カスタムカード（ノード）の定義 ---



// 🟩 出典カード

const SourceNode = ({ id, data, isConnectable }) => {

  return (

    <div style={{

      background: '#e6f4ea', border: '2px solid #137333', borderRadius: '8px',

      padding: '12px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'

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



// 🟦 根拠カード

const EvidenceNode = ({ id, data, isConnectable }) => {

  return (

    <div style={{

      background: '#e8f0fe', border: '2px solid #1a73e8', borderRadius: '8px',

      padding: '12px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'

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



// 🟥 自分の考えカード

const ThoughtNode = ({ id, data, isConnectable }) => {

  return (

    <div style={{

      background: '#fce8e6', border: '2px solid #d93025', borderRadius: '8px',

      padding: '12px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'

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

        placeholder="〜だから、◯◯なのではないかと考えた。" 

        value={data.text || ''} 

        onChange={(e) => data.onChange?.(id, 'text', e.target.value)}

        rows={3}

        style={{ width: '95%', padding: '4px', borderRadius: '4px', border: '1px solid #dadce0', resize: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' }}

      />

    </div>

  );

};



const nodeTypes = {

  sourceNode: SourceNode,

  evidenceNode: EvidenceNode,

  thoughtNode: ThoughtNode,

};





// --- 2. メインコンポーネント ---



export default function App() {

  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  

  // 見えない隠しfileインプットを参照するためのRef

  const fileInputRef = useRef(null);



  // カード内のテキスト変更をデータに反映

  const handleNodeDataChange = useCallback((id, key, value) => {

    setNodes((nds) =>

      nds.map((node) => {

        if (node.id === id) {

          return {

            ...node,

            data: { ...node.data, [key]: value }

          };

        }

        return node;

      })

    );

  }, [setNodes]);



  // カードを削除

  const handleNodeDelete = useCallback((id) => {

    setNodes((nds) => nds.filter((node) => node.id !== id));

    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));

  }, [setNodes, setEdges]);



  // 読み込んだノードデータに削除・変更関数を再バインドするヘルパー関数

  const bindNodeFunctions = useCallback((nodesArray) => {

    return nodesArray.map(node => ({

      ...node,

      data: {

        ...node.data,

        onChange: handleNodeDataChange,

        onDelete: handleNodeDelete,

      }

    }));

  }, [handleNodeDataChange, handleNodeDelete]);



  // 【自動読み込み】初回レンダリング時にLocalStorageから復元

  useEffect(() => {

    const savedCanvas = localStorage.getItem('explore-logic-canvas');

    if (savedCanvas) {

      try {

        const { savedNodes, savedEdges } = JSON.parse(savedCanvas);

        if (savedNodes) setNodes(bindNodeFunctions(savedNodes));

        if (savedEdges) setEdges(savedEdges);

      } catch (e) {

        console.error('データの復元に失敗しました', e);

      }

    }

  }, [setNodes, setEdges, bindNodeFunctions]);



  // 新しいカードを追加

  const addNode = (type) => {

    const id = `${type}-${Date.now()}`;

    const defaultSelectValue = type === 'sourceNode' ? 'Webサイト' : type === 'thoughtNode' ? '問い・疑問' : '';



    const newNode = {

      id,

      type,

      position: { x: 100 + Math.random() * 100, y: 150 + Math.random() * 100 },

      data: { 

        onChange: handleNodeDataChange, 

        onDelete: handleNodeDelete,

        title: '', 

        detail: '', 

        text: '', 

        type: defaultSelectValue 

      },

    };

    setNodes((nds) => nds.concat(newNode));

  };



  // 接続制限ルールの適用

  const onConnect = useCallback((params) => {

    const isSource = params.source.startsWith('sourceNode');

    const isEvidence = params.source.startsWith('evidenceNode');

    const targetIsEvidence = params.target.startsWith('evidenceNode');

    const targetIsThought = params.target.startsWith('thoughtNode');



    if (isSource && targetIsEvidence) {

      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#1a73e8', strokeWidth: 2 } }, eds));

      return;

    }

    if (isEvidence && targetIsThought) {

      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#d93025', strokeWidth: 2 } }, eds));

      return;

    }



    alert('【つなぎ方のルールエラー】\n「出典」➔「根拠」、または「根拠」➔「自分の考え」の順番でつなげよう！');

  }, [setEdges]);





  // 💾 LocalStorageへ保存

  const handleSaveToLocalStorage = () => {

    const nodesToSave = nodes.map(({ id, type, position, data }) => ({

      id,

      type,

      position,

      data: { title: data.title, detail: data.detail, text: data.text, type: data.type }

    }));



    const canvasData = { savedNodes: nodesToSave, savedEdges: edges };

    localStorage.setItem('explore-logic-canvas', JSON.stringify(canvasData));

    alert('ブラウザにキャンバスの状態を保存しました！');

  };



  // 📥 JSONファイルとしてダウンロード

  const handleDownloadJSON = () => {

    const nodesToSave = nodes.map(({ id, type, position, data }) => ({

      id,

      type,

      position,

      data: { title: data.title, detail: data.detail, text: data.text, type: data.type }

    }));



    const canvasData = { savedNodes: nodesToSave, savedEdges: edges };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(canvasData, null, 2))}`;

    

    const downloadAnchor = document.createElement('a');

    downloadAnchor.setAttribute('href', jsonString);

    downloadAnchor.setAttribute('download', 'logic-canvas-data.json');

    document.body.appendChild(downloadAnchor);

    downloadAnchor.click();

    downloadAnchor.remove();

  };



  // 📂 機能3: JSONファイルを読み込んで復元

  const handleUploadJSON = (event) => {

    const file = event.target.files?.[0];

    if (!file) return;



    const reader = new FileReader();

    reader.onload = (e) => {

      try {

        const json = JSON.parse(e.target?.result);

        

        // 簡単なデータ整合性チェック

        if (json && (json.savedNodes || json.savedEdges)) {

          setNodes(bindNodeFunctions(json.savedNodes || []));

          setEdges(json.savedEdges || []);

          alert('ファイルからキャンバスのデータを読み込みました！');

        } else {

          alert('エラー: 正しいキャンバスのデータファイルではありません。');

        }

      } catch (error) {

        alert('ファイルの読み込みに失敗しました。JSONの形式が正しくありません。');

        console.error(error);

      }

      // 同じファイルを連続で読み込めるようにインプットをリセット

      if (fileInputRef.current) fileInputRef.current.value = '';

    };

    reader.readAsText(file);

  };



  // 読み込みボタンが押されたとき、隠しインプットをクリックさせる

  const triggerFileInput = () => {

    fileInputRef.current?.click();

  };



  return (

    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>

      {/* 上部ヘッダー（コントロールパネル） */}

      <div style={{ padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

        <h3 style={{ margin: '0 15px 0 0', color: '#202124' }}>探究ロジックキャンバス</h3>

        

        {/* カード追加ボタン群 */}

        <button onClick={() => addNode('sourceNode')} style={{ background: '#137333', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>

          ＋ 出典を追加

        </button>

        <button onClick={() => addNode('evidenceNode')} style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>

          ＋ 根拠を追加

        </button>

        <button onClick={() => addNode('thoughtNode')} style={{ background: '#d93025', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>

          ＋ 自分の考えを追加

        </button>



        {/* 縦の区切り線 */}

        <div style={{ width: '1px', height: '25px', background: '#ccc', margin: '0 5px' }}></div>



        {/* 保存・ファイル操作系ボタン群 */}

        <button onClick={handleSaveToLocalStorage} style={{ background: '#5f6368', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>

          💾 保存

        </button>

        <button onClick={handleDownloadJSON} style={{ background: '#e8f0fe', color: '#1a73e8', border: '1px solid #1a73e8', padding: '7px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>

          📥 JSONダウンロード

        </button>



        {/* 📂 新設：ファイル読み込みボタン */}

        <button onClick={triggerFileInput} style={{ background: '#fff', color: '#5f6368', border: '1px solid #dadce0', padding: '7px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>

          📂 ファイルから読み込み

        </button>

        {/* 画面には表示しない隠しインプット要素 */}

        <input 

          type="file" 

          accept=".json" 

          ref={fileInputRef} 

          onChange={handleUploadJSON} 

          style={{ display: 'none' }} 

        />

      </div>



      {/* メインのキャンバスエリア */}

      <div style={{ flexGrow: 1 }}>

        <ReactFlow

          nodes={nodes}

          edges={edges}

          onNodesChange={onNodesChange}

          onEdgesChange={onEdgesChange}

          onConnect={onConnect}

          nodeTypes={nodeTypes}

          fitView

        >

          <Controls />

          <MiniMap />

          <Background variant="dots" gap={16} size={1} />

        </ReactFlow>

      </div>

    </div>

  );

}
