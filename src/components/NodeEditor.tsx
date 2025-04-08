import { useStore } from '../store/store';
import { useState, useEffect } from 'react';

interface NodeEditorProps {
  nodeId: string;
  onContentChange?: (content: string) => void;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ nodeId, onContentChange }) => {
  const { nodeStore } = useStore();
  const node = nodeStore.getNodeById(nodeId);
  const [localContent, setLocalContent] = useState(node?.content || '');

  useEffect(() => {
    if (node) {
      setLocalContent(node.content);
    }
  }, [node]);

  const handleContentChange = (content: string) => {
    setLocalContent(content);
    if (onContentChange) {
      onContentChange(content);
    }
  };

  return (
    <div className="h-full">
      <textarea
        value={localContent}
        onChange={(e) => handleContentChange(e.target.value)}
        className="w-full h-24 p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

export default NodeEditor;