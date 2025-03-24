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
      const header = '#'.repeat(level)
      let markdown = `${header} ${node.content}\n`
      
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const text = e.currentTarget.value
      const lineStart = text.lastIndexOf('\n', start - 1) + 1
      const currentLine = text.substring(lineStart)
      const match = currentLine.match(/^(#+)/)
      if (match) {
        const newText = text.substring(0, lineStart) + '#' + currentLine
        setMarkdown(newText)
        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 1
      }
    }
  }

  return (
    <div className="w-full h-full p-8 bg-white flex flex-col gap-4">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => {
            const textarea = document.querySelector('textarea')
            if (!textarea) return
            const start = textarea.selectionStart
            const text = textarea.value
            const lineStart = text.lastIndexOf('\n', start - 1) + 1
            const lineEnd = text.indexOf('\n', start)
            const currentLine = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd)
            // Remove unused currentIndent variable
            const newText = text.substring(0, lineStart) + 
              '  ' + text.substring(lineStart)
            setMarkdown(newText)
          }}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          →
        </button>
        <button
          onClick={() => {
            const textarea = document.querySelector('textarea')
            if (!textarea) return
            const start = textarea.selectionStart
            const text = textarea.value
            const lineStart = text.lastIndexOf('\n', start - 1) + 1
            const currentLine = text.substring(lineStart)
            if (currentLine.startsWith('  ')) {
              setMarkdown(text.substring(0, lineStart) + currentLine.substring(2))
            }
          }}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          ←
        </button>
      </div>
      <textarea
        value={markdown}
        onChange={handleMarkdownChange}
        onKeyDown={handleKeyDown}
        className="flex-1 w-full p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Edit your mind map using bullets (• -) and arrows to control layers..."
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