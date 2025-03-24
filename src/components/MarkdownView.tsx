import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import { useState, useEffect } from 'react'
import type { INode, NodeLevel } from '../store/nodeStore'
import { NodeFactory } from '../store/nodeStore'

const MarkdownView = observer(() => {
  const { nodeStore } = useStore()
  const [markdown, setMarkdown] = useState('')

  useEffect(() => {
    setMarkdown(generateMarkdown())
  }, [nodeStore.allNodes])

  const generateMarkdown = () => {
    const centralNode = nodeStore.getNodeById(nodeStore.centralNodeId)
    if (!centralNode) return ''

    const processNode = (node: INode, level: number): string => {
      const indent = '#'.repeat(level)
      let markdown = `${indent} ${node.content}\n\n`
      
      const children = nodeStore.getChildNodes(node.id)
      children.forEach(child => {
        markdown += processNode(child, level + 1)
      })
      
      return markdown
    }

    return processNode(centralNode, 1)
  }

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value)
  }

  const handleSave = () => {
    const lines = markdown.split('\n').filter(line => line.trim())
    // Track nodes at each level
    const levelNodes = new Map<number, INode>()
    let lastNode: INode | null = null
  
    lines.forEach(line => {
      const match = line.match(/^(#+)\s+(.+)/)
      if (match) {
        const level = match[1].length
        const content = match[2].trim()
        
        if (level === 1) {
          // Update central node
          nodeStore.updateNodeContent(nodeStore.centralNodeId, content)
          const centralNode = nodeStore.getNodeById(nodeStore.centralNodeId)
          if (centralNode) {
            lastNode = centralNode
            levelNodes.set(level, centralNode)
          }
        } else {
          // Create or update child nodes
          if (lastNode) {
            const parentLevel = level - 1
            const parentNode = levelNodes.get(parentLevel)
            
            if (parentNode) {
              const existingChildren = nodeStore.getChildNodes(parentNode.id)
              const existingChild = existingChildren.find(child => child.content === content)
              
              if (existingChild) {
                lastNode = existingChild
                levelNodes.set(level, existingChild)
              } else {
                const newNode = NodeFactory.createChildNode({
                  position: { x: 0, y: 0 },
                  title: content,
                  parentId: parentNode.id,
                  level: level as NodeLevel,
                  branchColor: parentNode.branchColor || '#4A5568'
                })
                nodeStore.addNode(newNode)
                nodeStore.getConnectionStore().addConnection(parentNode.id, newNode.id)
                lastNode = newNode
                levelNodes.set(level, newNode)
              }
            }
          }
        }
      }
    })
  }

  return (
    <div className="w-full h-full p-8 bg-white flex flex-col gap-4">
      <textarea
        value={markdown}
        onChange={handleMarkdownChange}
        className="flex-1 w-full p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Edit your mind map in markdown format..."
      />
      <button
        onClick={handleSave}
        className="self-end px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        Save Changes
      </button>
    </div>
  )
})

export default MarkdownView