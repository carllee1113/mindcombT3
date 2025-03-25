import type { INode } from '../store/store'

export function generateFreeMindXML(nodes: INode[], centralNodeId: string): string {
  const buildNodeXML = (node: INode, nodes: INode[]): string => {
    const childNodes = nodes.filter(n => n.parentId === node.id)
    const childrenXML = childNodes.map(child => buildNodeXML(child, nodes)).join('')
    
    return `<node ID="${node.id}" TEXT="${escapeXML(node.content)}"${childrenXML ? `>${childrenXML}</node>` : '/>'}`
  }

  const escapeXML = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const centralNode = nodes.find(node => node.id === centralNodeId)
  if (!centralNode) return ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  ${buildNodeXML(centralNode, nodes)}
</map>`
}

export function downloadFreeMind(xml: string, filename: string = 'mindmap.mm'): void {
  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}