import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import { useState, useEffect } from 'react'


const MarkdownView = observer(() => {
  const { nodeStore, uiStore } = useStore()
  const [markdown, setMarkdown] = useState('')

  // This effect will run whenever the node content changes
  useEffect(() => {
    // Only generate markdown when in markdown view
    if (uiStore.viewMode === 'markdown') {
      const generateMarkdown = () => {
        // Access the observable collection to ensure proper reactivity
        const nodes = Array.from(nodeStore.allNodes)
        const centralNode = nodeStore.getNodeById(nodeStore.centralNodeId)
        if (!centralNode || nodes.length === 0) return ''

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

      // Update markdown content
      setMarkdown(generateMarkdown())
    }
  }, [
    // Track node content changes more precisely
    nodeStore.allNodes.length,
    ...Array.from(nodeStore.allNodes).flatMap(node => [
      node.id,
      node.title,
      node.content,
      nodeStore.getChildNodes(node.id).length
    ]),
    uiStore.viewMode,
    nodeStore.centralNodeId
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