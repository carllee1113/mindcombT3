import { observer } from 'mobx-react-lite'
import { useStore } from '../store/store'
import { useState, useEffect } from 'react'
import type { INode } from '../store/nodeStore'

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

  return (
    <div className="w-full h-full p-8 bg-white flex flex-col gap-4">
      <pre className="flex-1 w-full p-4 font-mono text-sm border rounded-lg whitespace-pre-wrap overflow-auto">
        {markdown}
      </pre>
    </div>
  )
})

export default MarkdownView