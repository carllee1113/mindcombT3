import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import { useState, useEffect } from 'react'

const MarkdownView = observer(() => {
  const { nodeStore, uiStore } = useStore()
  const [markdown, setMarkdown] = useState('')

  useEffect(() => {
    if (uiStore.viewMode === 'markdown') {
      const generateMarkdown = () => {
        // Access nodes through the store's computed property
        const nodes = nodeStore.nodesAsArray
        const centralNode = nodeStore.getNodeById(nodeStore.centralNodeId)
        if (!centralNode || nodes.length === 0) return ''
        
        // This ensures MobX tracks node content changes
        nodes.forEach(node => node.content)

        const cleanContent = (content: string): string => {
          return content
            .replace(/\[!\[CDATA\[(.*?)\]\]\]/g, '$1')
            .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .trim()
        }

        const buildMarkdown = (nodeId: string, actualLevel: number = 1): string => {
          const node = nodeStore.getNodeById(nodeId)
          if (!node) return ''

          // Use actual level for markdown, regardless of node's stored level
          const nodeText = node.title || node.content
          let md = `${'#'.repeat(actualLevel)} ${cleanContent(nodeText)}\n\n`
          
          const childNodes = nodeStore.getChildNodes(nodeId)
          childNodes.forEach(childNode => {
            md += buildMarkdown(childNode.id, actualLevel + 1)
          })
          return md
        }

        return buildMarkdown(centralNode.id)
      }

      setMarkdown(generateMarkdown())
    }
  }, [
    uiStore.viewMode,
    nodeStore.centralNodeId,
    nodeStore.nodesAsArray // Use computed property instead of allNodes
  ])

  // Only render when viewMode is 'markdown'
  if (uiStore.viewMode !== 'markdown') {
    return null
  }

  return (
    <div className="w-full h-full p-8 bg-white flex flex-col gap-4">
      <pre className="flex-1 w-full p-4 font-mono text-sm border rounded-lg whitespace-pre-wrap overflow-auto">
        {markdown}
      </pre>
    </div>
  )
})

export default MarkdownView