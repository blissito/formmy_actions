import React, { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Settings, Video, Image } from 'lucide-react';

export interface FFmpegNodeData {
  label?: string;
  config?: {
    resolution?: string;
    fps?: number;
    duration?: number;
    format?: string;
    transition?: string;
  };
  inputs?: any;
  outputs?: any;
}

export const FFmpegNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState((data as any)?.config || {
    resolution: '1080x1920',
    fps: 30,
    duration: 3,
    format: 'mp4',
    transition: 'fade'
  });

  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 ${selected ? 'border-purple-500' : 'border-gray-300'} w-[320px] min-h-[280px]`}>
      <Handle type="target" position={Position.Left} id="images" className="!bg-blue-500" />
      <Handle type="target" position={Position.Left} id="audio" className="!bg-green-500" style={{ top: '60%' }} />
      <Handle type="target" position={Position.Left} id="subtitles" className="!bg-yellow-500" style={{ top: '80%' }} />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">FFmpeg Video</span>
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
              <label className="text-xs text-gray-600">Resolution</label>
              <select 
                value={config.resolution}
                onChange={(e) => setConfig({...config, resolution: e.target.value})}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="1080x1920">1080x1920 (9:16)</option>
                <option value="1920x1080">1920x1080 (16:9)</option>
                <option value="1080x1080">1080x1080 (1:1)</option>
                <option value="720x1280">720x1280 (9:16)</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs text-gray-600">FPS</label>
              <input 
                type="number" 
                value={config.fps}
                onChange={(e) => setConfig({...config, fps: parseInt(e.target.value)})}
                className="w-full p-1 text-sm border rounded"
                min="15"
                max="60"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-600">Duration per image (s)</label>
              <input 
                type="number" 
                value={config.duration}
                onChange={(e) => setConfig({...config, duration: parseFloat(e.target.value)})}
                className="w-full p-1 text-sm border rounded"
                min="0.5"
                max="10"
                step="0.5"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-600">Transition</label>
              <select 
                value={config.transition}
                onChange={(e) => setConfig({...config, transition: e.target.value})}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="dissolve">Dissolve</option>
                <option value="wipe">Wipe</option>
                <option value="slide">Slide</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Image className="w-3 h-3" />
            <span>Images input</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Audio (optional)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>Subtitles (optional)</span>
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} id="video" className="!bg-purple-500" />
    </div>
  );
};

import { ComponentExecutor, type ExecutionContext, type ExecutionResult } from '../runtime/ExecutionEngine';

// Executor for FFmpeg Tool
export class FFmpegExecutor extends ComponentExecutor {
  runtime = 'ffmpeg' as const;
  
  canExecute(context: ExecutionContext): boolean {
    return context.componentName === 'ffmpeg' || context.framework === 'ffmpeg';
  }
  
  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const { images, audio, subtitles } = context.inputs;
    const config = context.parameters || {};
    
    // Simulated FFmpeg command generation
    const commands = this.generateFFmpegCommand(images, audio, subtitles, config);
    
    // In real implementation, this would:
    // 1. Save images to temp directory
    // 2. Execute FFmpeg via child_process
    // 3. Return path to generated video
    
    // For now, return mock result
    return {
      nodeId: context.nodeId,
      outputs: {
        video: '/tmp/output.mp4',
        metadata: {
          resolution: config.resolution || '1080x1920',
          fps: config.fps || 30,
          duration: (images?.length || 3) * (config.duration || 3),
          format: 'mp4',
          hasAudio: !!audio,
          hasSubtitles: !!subtitles
        }
      },
      status: 'success',
      executionTime: 2500,
      logs: [
        `FFmpeg command: ${commands}`,
        'Processing images...',
        'Applying transitions...',
        audio ? 'Adding audio track...' : '',
        subtitles ? 'Burning subtitles...' : '',
        'Video generated successfully!'
      ].filter(Boolean)
    };
  }
  
  private generateFFmpegCommand(_images: string[], audio?: string, subtitles?: string, config: any = {}): string {
    const { resolution = '1080x1920', fps = 30, duration = 3 } = config;
    
    let cmd = 'ffmpeg';
    
    // Input images
    cmd += ` -framerate ${1/duration} -i frame%d.jpg`;
    
    // Audio input if provided
    if (audio) {
      cmd += ` -i ${audio}`;
    }
    
    // Video filters
    const [width, height] = resolution.split('x');
    cmd += ` -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;
    
    // Add subtitles if provided
    if (subtitles) {
      cmd += `,subtitles=${subtitles}:force_style='FontSize=24,PrimaryColour=&HFFFFFF&'`;
    }
    
    cmd += '"';
    
    // Output settings
    cmd += ` -c:v libx264 -r ${fps} -pix_fmt yuv420p`;
    
    // Audio codec if audio provided
    if (audio) {
      cmd += ' -c:a aac -shortest';
    }
    
    cmd += ' output.mp4';
    
    return cmd;
  }
  
}