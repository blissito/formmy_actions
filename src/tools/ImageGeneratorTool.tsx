import React, { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ImageIcon, Sparkles, Settings } from 'lucide-react';

export interface ImageGeneratorNodeData {
  label?: string;
  config?: {
    provider?: 'static' | 'dalle' | 'midjourney' | 'stable-diffusion';
    count?: number;
    style?: string;
    resolution?: string;
    staticImages?: string[];
  };
}

export const ImageGeneratorNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState((data as any)?.config || {
    provider: 'static',
    count: 3,
    style: 'cinematic',
    resolution: '1024x1024',
    staticImages: [
      '/assets/sample1.jpg',
      '/assets/sample2.jpg',
      '/assets/sample3.jpg'
    ]
  });

  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 ${selected ? 'border-indigo-500' : 'border-gray-300'} w-[300px] min-h-[260px]`}>
      <Handle type="target" position={Position.Left} id="prompt" className="!bg-blue-500" />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold">Image Generator</span>
          </div>
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {isConfigOpen && (
          <div className="space-y-2 border-t pt-3 mt-3">
            <div>
              <label className="text-xs text-gray-600">Provider</label>
              <select 
                value={config.provider}
                onChange={(e) => setConfig({...config, provider: e.target.value as any})}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="static">Static (Demo)</option>
                <option value="dalle">DALL-E 3</option>
                <option value="midjourney">Midjourney</option>
                <option value="stable-diffusion">Stable Diffusion</option>
              </select>
            </div>
            
            {config.provider !== 'static' && (
              <>
                <div>
                  <label className="text-xs text-gray-600">Number of Images</label>
                  <input 
                    type="number" 
                    value={config.count}
                    onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
                    className="w-full p-1 text-sm border rounded"
                    min="1"
                    max="10"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600">Style</label>
                  <select 
                    value={config.style}
                    onChange={(e) => setConfig({...config, style: e.target.value})}
                    className="w-full p-1 text-sm border rounded"
                  >
                    <option value="cinematic">Cinematic</option>
                    <option value="photorealistic">Photorealistic</option>
                    <option value="anime">Anime</option>
                    <option value="cartoon">Cartoon</option>
                    <option value="abstract">Abstract</option>
                    <option value="oil-painting">Oil Painting</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600">Resolution</label>
                  <select 
                    value={config.resolution}
                    onChange={(e) => setConfig({...config, resolution: e.target.value})}
                    className="w-full p-1 text-sm border rounded"
                  >
                    <option value="1024x1024">1024x1024</option>
                    <option value="1024x1792">1024x1792 (Portrait)</option>
                    <option value="1792x1024">1792x1024 (Landscape)</option>
                  </select>
                </div>
              </>
            )}
            
            {config.provider === 'static' && (
              <div>
                <label className="text-xs text-gray-600">Static Images</label>
                <div className="space-y-1 mt-1">
                  {config.staticImages?.map((img: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <ImageIcon className="w-3 h-3 text-gray-400" />
                      <input 
                        type="text"
                        value={img}
                        onChange={(e) => {
                          const newImages = [...(config.staticImages || [])];
                          newImages[idx] = e.target.value;
                          setConfig({...config, staticImages: newImages});
                        }}
                        className="flex-1 p-1 text-xs border rounded"
                        placeholder={`Image ${idx + 1} path`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">●</span>
            <span>Prompt input</span>
          </div>
          <div className="mt-1 text-gray-500">
            {config.provider === 'static' 
              ? `Returns ${config.staticImages?.length || 0} static images`
              : `Generates ${config.count} images`
            }
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} id="images" className="!bg-indigo-500" />
    </div>
  );
};

import { ComponentExecutor, type ExecutionContext, type ExecutionResult } from '../runtime/ComponentExecutor';

// Executor for Image Generator
export class ImageGeneratorExecutor extends ComponentExecutor {
  runtime = 'image-generator' as const;
  
  canExecute(context: ExecutionContext): boolean {
    return context.componentName === 'image-generator' || context.framework === 'image-generator';
  }
  
  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const { prompt } = context.inputs;
    const config = context.parameters || {};
    
    // Phase 1: Return static images
    if (config.provider === 'static' || !config.provider) {
      const staticImages = config.staticImages || [
        'https://picsum.photos/1080/1920?random=1',
        'https://picsum.photos/1080/1920?random=2', 
        'https://picsum.photos/1080/1920?random=3'
      ];
      
      return {
        nodeId: context.nodeId,
        outputs: {
          images: staticImages,
          metadata: {
            source: 'static',
            count: staticImages.length,
            prompt: prompt || 'N/A'
          }
        },
        status: 'success',
        executionTime: 100,
        logs: [
          `Using static image provider`,
          `Returning ${staticImages.length} pre-configured images`,
          'Images ready for processing'
        ]
      };
    }
    
    // Phase 2: AI generation (mock for now)
    const generatedImages: string[] = [];
    for (let i = 0; i < (config.count || 3); i++) {
      // In real implementation, call DALL-E or other API
      generatedImages.push(`https://generated-image-${i}.jpg`);
    }
    
    return {
      nodeId: context.nodeId,
      outputs: {
        images: generatedImages,
        metadata: {
          source: config.provider,
          count: generatedImages.length,
          prompt,
          style: config.style,
          resolution: config.resolution
        }
      },
      status: 'success',
      executionTime: 3000,
      logs: [
        `Generating images with ${config.provider}...`,
        `Prompt: "${prompt}"`,
        `Style: ${config.style}`,
        `Resolution: ${config.resolution}`,
        `Generated ${generatedImages.length} images successfully`
      ]
    };
  }
  
}