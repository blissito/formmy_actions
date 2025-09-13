/**
 * AgentFlow V2 Generator
 * Adapted from Flowise for formmy-actions
 * Generates intelligent workflow configurations using LLMs
 */

import { z } from 'zod';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StructuredOutputParser } from '@langchain/core/output_parsers';

// Schema definitions for workflow generation
const ToolType = z.array(z.string()).describe('List of tools');

const NodePositionType = z.object({
  x: z.number().describe('X coordinate'),
  y: z.number().describe('Y coordinate')
});

const NodeDataType = z.object({
  label: z.string().optional(),
  name: z.string().optional(),
  tool: z.string().optional(),
  config: z.record(z.any()).optional()
}).optional();

const NodeType = z.object({
  id: z.string().describe('Unique identifier'),
  type: z.enum(['agent', 'tool', 'input', 'output']).describe('Node type'),
  position: NodePositionType,
  data: NodeDataType
});

const EdgeType = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional()
});

const WorkflowType = z.object({
  description: z.string().optional(),
  nodes: z.array(NodeType),
  edges: z.array(EdgeType)
});

export interface AgentFlowConfig {
  model: BaseChatModel;
  availableTools: string[];
  availableAgents?: string[];
}

export interface GeneratedWorkflow {
  nodes: any[];
  edges: any[];
  description?: string;
  error?: string;
}

export class AgentFlowV2Generator {
  private config: AgentFlowConfig;

  constructor(config: AgentFlowConfig) {
    this.config = config;
  }

  /**
   * Generate a complete workflow from a natural language description
   */
  async generateWorkflow(
    description: string,
    userGoal: string
  ): Promise<GeneratedWorkflow> {
    try {
      // Step 1: Generate workflow structure
      const workflow = await this.generateWorkflowStructure(description, userGoal);

      // Step 2: Select tools for agents
      const nodesWithTools = await this.selectToolsForAgents(
        workflow.nodes,
        userGoal
      );

      // Step 3: Optimize connections
      const optimizedEdges = this.optimizeEdges(nodesWithTools, workflow.edges);

      return {
        nodes: nodesWithTools,
        edges: optimizedEdges,
        description: workflow.description
      };
    } catch (error: any) {
      console.error('Error generating workflow:', error);
      return {
        nodes: [],
        edges: [],
        error: error.message || 'Failed to generate workflow'
      };
    }
  }

  /**
   * Generate the basic workflow structure
   */
  private async generateWorkflowStructure(
    description: string,
    userGoal: string
  ): Promise<GeneratedWorkflow> {
    const parser = StructuredOutputParser.fromZodSchema(WorkflowType);
    const formatInstructions = parser.getFormatInstructions();

    const systemPrompt = `You are an AI workflow architect. Your task is to design efficient workflows that accomplish user goals.

Available tools: ${this.config.availableTools.join(', ')}
${this.config.availableAgents ? `Available agents: ${this.config.availableAgents.join(', ')}` : ''}

Guidelines:
1. Create minimal but effective workflows
2. Use agents for complex reasoning tasks
3. Use tools for specific actions
4. Always include input and output nodes
5. Ensure logical flow from input to output

${formatInstructions}`;

    const userPrompt = `Goal: ${userGoal}
Description: ${description}

Design a workflow that accomplishes this goal efficiently.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    const response = await this.config.model.invoke(messages);
    const responseContent = response.content.toString();

    // Extract and parse JSON
    const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) ||
                     responseContent.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      return WorkflowType.parse(parsed) as GeneratedWorkflow;
    }

    throw new Error('Failed to generate valid workflow structure');
  }

  /**
   * Select appropriate tools for agent nodes
   */
  private async selectToolsForAgents(
    nodes: any[],
    userGoal: string
  ): Promise<any[]> {
    const updatedNodes = [...nodes];
    const selectedTools: string[] = [];

    for (let i = 0; i < updatedNodes.length; i++) {
      const node = updatedNodes[i];

      if (node.type === 'agent') {
        const tools = await this.selectToolsForAgent(
          node,
          userGoal,
          selectedTools
        );

        if (tools.length > 0) {
          node.data = {
            ...node.data,
            tools,
            config: {
              ...node.data?.config,
              selectedTools: tools
            }
          };
          selectedTools.push(...tools);
        }
      }
    }

    return updatedNodes;
  }

  /**
   * Select tools for a specific agent
   */
  private async selectToolsForAgent(
    agentNode: any,
    userGoal: string,
    alreadySelected: string[]
  ): Promise<string[]> {
    const availableTools = this.config.availableTools.filter(
      tool => !alreadySelected.includes(tool)
    );

    if (availableTools.length === 0) {
      return [];
    }

    const systemPrompt = `You are selecting tools for an agent in a workflow.

Agent: ${agentNode.data?.label || agentNode.id}
Available tools: ${availableTools.join(', ')}
Already selected tools: ${alreadySelected.join(', ') || 'none'}

Select 1-3 tools that would be most useful for this agent to accomplish the goal.
Return only the tool names as a JSON array.

Example: ["tool1", "tool2"]`;

    const userPrompt = `Goal: ${userGoal}
Select the most appropriate tools for this agent.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    try {
      const response = await this.config.model.invoke(messages);
      const content = response.content.toString();
      const match = content.match(/\[.*\]/);

      if (match) {
        const tools = JSON.parse(match[0]);
        return tools.filter((tool: string) => availableTools.includes(tool));
      }
    } catch (error) {
      console.error('Error selecting tools for agent:', error);
    }

    return [];
  }

  /**
   * Optimize edges for better workflow execution
   */
  private optimizeEdges(nodes: any[], edges: any[]): any[] {
    // Filter out invalid edges
    const validEdges = edges.filter(edge => {
      const sourceExists = nodes.some(n => n.id === edge.source);
      const targetExists = nodes.some(n => n.id === edge.target);
      return sourceExists && targetExists;
    });

    // Add edge metadata
    return validEdges.map(edge => ({
      ...edge,
      id: `${edge.source}-${edge.target}`,
      type: 'smoothstep',
      animated: edge.source.includes('input') || edge.target.includes('output')
    }));
  }

  /**
   * Validate a generated workflow
   */
  validateWorkflow(workflow: GeneratedWorkflow): boolean {
    // Check for required nodes
    const hasInput = workflow.nodes.some(n => n.type === 'input');
    const hasOutput = workflow.nodes.some(n => n.type === 'output');

    if (!hasInput || !hasOutput) {
      return false;
    }

    // Check for orphaned nodes
    for (const node of workflow.nodes) {
      if (node.type === 'input' || node.type === 'output') continue;

      const hasIncoming = workflow.edges.some(e => e.target === node.id);
      const hasOutgoing = workflow.edges.some(e => e.source === node.id);

      if (!hasIncoming && !hasOutgoing) {
        return false;
      }
    }

    return true;
  }
}