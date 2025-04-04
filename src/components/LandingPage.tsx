import { useStore } from '../store/store'

const LandingPage = () => {
  const { uiStore } = useStore()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 overflow-y-auto" style={{ height: '100vh' }}>
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Transform Your Ideas Into Clear Mind Maps
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Mindcomb helps you organize thoughts, brainstorm ideas, and create beautiful mind maps with ease.
            </p>
            <button 
              onClick={() => {
  uiStore.setShowLandingPage(false);
  uiStore.viewMode = 'mindmap';
}}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
            >
              Start Mapping
            </button>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <img 
              src="/templates/0404blog002.png" 
              alt="SCORE Framework Mind Map Preview" 
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Intuitive Interface"
              description="Create and edit mind maps with simple clicks and drags"
              icon="🎯"
            />
            <FeatureCard 
              title="Import/Export"
              description="Compatible with FreeMind format for seamless integration"
              icon="🔄"
            />
            <FeatureCard 
              title="Smart Layout"
              description="Automatic node positioning and branch organization"
              icon="✨"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const FeatureCard = ({ title, description, icon }: { 
  title: string
  description: string
  icon: string 
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)

export default LandingPage