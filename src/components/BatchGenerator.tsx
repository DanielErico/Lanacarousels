import React, { useState } from 'react';
import { Layers, Wand2, ArrowRight, RefreshCw } from 'lucide-react';
import { Carousel } from '../types/lana';

interface BatchGeneratorProps {
  onSelectConcept: (concept: Carousel) => void;
}

export const BatchGenerator: React.FC<BatchGeneratorProps> = ({ onSelectConcept }) => {
  const [topic, setTopic] = useState('How AI Automation Increases Instagram Engagement by 300%');
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchConcepts, setBatchConcepts] = useState<Carousel[]>([
    {
      id: 'batch-1',
      brandId: 'brand-1',
      title: 'Concept A: Sky Blue × Orange — Business Growth',
      sourceType: 'batch',
      status: 'draft',
      stylePreset: 'navy_orange_diagonal',
      frameworkType: 'educational_tips',
      hookType: 'bold_claim',
      platformSpec: 'ig_4_5',
      slides: [
        {
          id: 'b1-1',
          orderIndex: 0,
          type: 'hook',
          badge: '01/05',
          headline: 'BUSINESS',
          subtext: 'Swipe to discover 4 powerful growth strategies.',
          bgGradient: '#0284C7',
          textColor: '#FFFFFF',
          accentColor: '#E8691C'
        }
      ],
      caption: { id: 'c1', text: 'Concept A: Sky Blue Orange — a bold business growth framing.', hashtags: ['#BusinessGrowth'], cta: 'Save post' },
      performanceScore: { overall: 87, hookStrength: 91, readability: 85, slideFlow: 88, captionEngagement: 82, suggestions: [] }
    },
    {
      id: 'batch-2',
      brandId: 'brand-2',
      title: 'Concept B: Black × Sky Blue Wave — Agency',
      sourceType: 'batch',
      status: 'draft',
      stylePreset: 'agency_black_blue_wave',
      frameworkType: 'storytelling_case_study',
      hookType: 'contrarian',
      platformSpec: 'ig_4_5',
      slides: [
        {
          id: 'b2-1',
          orderIndex: 0,
          type: 'hook',
          badge: '01',
          headline: 'BUSINESS SOLUTION AGENCY',
          subtext: 'Always Research And Be Unique.',
          bgGradient: '#0A0A0A',
          textColor: '#FFFFFF',
          accentColor: '#0EA5E9'
        }
      ],
      caption: { id: 'c2', text: 'Concept B: Agency storytelling with bold authority.', hashtags: ['#AgencyLife'], cta: 'Visit our website' },
      performanceScore: { overall: 79, hookStrength: 84, readability: 78, slideFlow: 80, captionEngagement: 74, suggestions: [] }
    },
    {
      id: 'batch-3',
      brandId: 'brand-1',
      title: 'Concept C: Dark AI × Purple Tech',
      sourceType: 'batch',
      status: 'draft',
      stylePreset: 'ai_dark_tech_purple',
      frameworkType: 'listicle_tools',
      hookType: 'curiosity_question',
      platformSpec: 'ig_4_5',
      slides: [
        {
          id: 'b3-1',
          orderIndex: 0,
          type: 'hook',
          badge: '01/05',
          headline: 'FUTURE BUSINESS WITH ARTIFICIAL INTELLIGENCE',
          subtext: 'How AI is reshaping the modern business landscape.',
          bgGradient: '#0369A1',
          textColor: '#FFFFFF',
          accentColor: '#7B7BFF'
        }
      ],
      caption: { id: 'c3', text: 'Concept C: AI Tech framing for cutting-edge authority.', hashtags: ['#ArtificialIntelligence'], cta: 'Follow for AI insights' },
      performanceScore: { overall: 92, hookStrength: 95, readability: 90, slideFlow: 93, captionEngagement: 89, suggestions: [] }
    }
  ]);

  const handleGenerateBatch = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="navy-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-sky-600 text-white">
            <Layers className="w-6 h-6 text-sky-100" />
          </div>
          <div>
            <h2 className="font-headline text-2xl font-extrabold text-slate-900">Batch Concept Generator</h2>
            <p className="text-xs text-slate-500">Generate 3 distinct carousel angles per topic with custom template presets.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Enter topic or goal..."
            className="w-full navy-input px-4 py-2.5 rounded-xl text-xs"
          />
          <button
            onClick={handleGenerateBatch}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shrink-0 flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-sky-100" />}
            <span>{isGenerating ? 'Generating Batch...' : 'Generate 3 Concepts'}</span>
          </button>
        </div>
      </div>

      {/* Concept Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {batchConcepts.map((concept, idx) => (
          <div key={concept.id} className="navy-card navy-card-hover rounded-3xl p-6 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold uppercase tracking-wider">
                  Option 0{idx + 1}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  Score: {concept.performanceScore.overall}
                </span>
              </div>

              {/* Card Mini Preview */}
              <div 
                className={`carousel-aspect-ratio w-full rounded-2xl p-5 bg-gradient-to-b ${concept.slides[0].bgGradient} border border-slate-800 flex flex-col justify-between text-white shadow-lg relative overflow-hidden`}
              >
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase self-start bg-white text-slate-900"
                >
                  {concept.slides[0].badge}
                </span>
                <h4 className="font-display text-lg font-bold leading-tight my-auto">
                  {concept.slides[0].headline}
                </h4>
                <p className="text-[11px] opacity-80">{concept.slides[0].subtext}</p>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{concept.title}</h3>
            </div>

            <button
              onClick={() => onSelectConcept(concept)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 transition-all group"
            >
              <span>Select & Edit in Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
