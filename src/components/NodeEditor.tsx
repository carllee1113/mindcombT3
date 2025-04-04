import { useStore } from '../store/store';
import { useState, useEffect } from 'react';

interface NodeEditorProps {
  nodeId: string;
}

const NodeEditor = ({ nodeId }: NodeEditorProps) => {
  const { nodeStore } = useStore();
  const [localContent, setLocalContent] = useState('');

  useEffect(() => {
    const node = nodeStore.getNodeById(nodeId);
    if (node) setLocalContent(node.content);
  }, [nodeId, nodeStore]);

  const handleContentChange = (content: string) => {
    setLocalContent(content);
    nodeStore.updateNodeContent(nodeId, content);
  };

  return (
    <div>
      <textarea 
        value={localContent}
        onChange={(e) => handleContentChange(e.target.value)}
      />
    </div>
  );
}

export default NodeEditor;