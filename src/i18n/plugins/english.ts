/**
 * Plugin de Idioma Inglés - formmy-actions
 * Ejemplo de cómo agregar idiomas adicionales
 */

import type { LanguageCode } from '../index';

export interface LanguagePlugin {
  code: LanguageCode;
  name: string;
  nativeName: string;
  translations: Record<string, string | Record<string, string>>;
}

export const englishPlugin: LanguagePlugin = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  translations: {
    // Navigation and General UI
    workflow: 'Workflow',
    start: 'Start',
    execute: 'Execute',
    save: 'Save',
    export: 'Export',
    import: 'Import',
    settings: 'Settings',
    cancel: 'Cancel',
    delete: 'Delete',
    duplicate: 'Duplicate',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',

    // Execution states
    idle: 'Idle',
    running: 'Running',
    completed: 'Completed',
    error: 'Error',
    paused: 'Paused',

    // StartNode
    startNode: {
      title: 'Start',
      description: 'Starting point of the agentflow',
      startAgentflow: 'Start Agentflow',
      startingWorkflow: 'Starting Workflow...',
      configuration: 'Configuration',

      inputType: 'Input Type',
      chatInput: 'Chat Input',
      chatInputDesc: 'Start the conversation with chat input',
      formInput: 'Form Input',
      formInputDesc: 'Start the workflow with form inputs',

      formTitle: 'Form Title',
      formTitlePlaceholder: 'Please Fill Out The Form',
      formDescription: 'Form Description',
      formDescPlaceholder: 'Complete all fields below to continue',
      formInputTypes: 'Form Input Types',

      flowState: 'Flow State',
      flowStateDesc: 'Runtime state during the execution of the workflow',

      ephemeralMemory: 'Ephemeral Memory',
      ephemeralMemoryDesc: 'Start fresh for every execution without past chat history',
      persistState: 'Persist State',
      persistStateDesc: 'Persist the state in the same session',

      executionId: 'Execution ID',
      flowStateVars: 'Flow State Variables'
    },

    // ChatNode
    chatNode: {
      title: 'Chat Interface',
      noMessages: 'No messages yet',
      startConversation: 'Start a conversation below',
      connectInput: 'Connect an input to begin',
      typeMessage: 'Type your message...',
      connectFirst: 'Connect an input first',
      clearChat: 'Clear Chat',
      expand: 'Expand',
      collapse: 'Collapse',
      workflowRunning: 'Workflow Running',
      messages: 'messages',
      user: 'user',
      assistant: 'assistant',
      workflow: 'Workflow'
    },

    // AgentNodes
    agentNodes: {
      reactAgent: 'ReAct Agent',
      conversationalAgent: 'Conversational Agent',
      workflowGenerator: 'Workflow Generator',

      taskDescription: 'Task Description',
      taskPlaceholder: 'Describe what the agent should accomplish...',
      maxIterations: 'Max Iterations',
      executeAgent: 'Execute Agent',
      executing: 'Executing...',
      processing: 'Processing...',

      message: 'Message',
      messagePlaceholder: 'What do you want to ask the agent?',
      systemMessage: 'System Message',
      systemMessagePlaceholder: 'Custom instructions for the agent...',
      lastResponse: 'Last Response',

      status: 'Status',
      result: 'Result'
    },

    // Sidebar
    sidebar: {
      aiAgents: 'AI Agents',
      frameworks: 'Frameworks',
      vercelAI: 'Vercel AI',
      llamaIndex: 'LlamaIndex',
      custom: 'Custom',

      executeFlow: 'Execute Flow',
      executionResult: 'Execution Result',
      executionLogs: 'Execution Logs',
      globalSettings: 'Global Settings'
    },

    // System messages
    system: {
      workflowSaved: 'Workflow saved successfully! 💾',
      workflowExecuted: 'Flow executed successfully!',
      executingFlow: 'Executing flow...',
      noChangesToSave: 'No changes to save',
      unsavedChanges: 'Are you sure you want to exit? There are unsaved changes.',

      flowExported: 'Flow exported successfully!',
      flowImported: 'Flow imported successfully!',
      failedToImport: 'Failed to import flow',

      executionFailed: 'Execution failed',
      nodeExecutionFailed: 'Failed to execute node'
    },

    // Form types
    formTypes: {
      string: 'String',
      number: 'Number',
      boolean: 'Boolean',
      options: 'Options',

      label: 'Label',
      labelPlaceholder: 'Label for the input',
      variableName: 'Variable Name',
      variableNamePlaceholder: 'Variable name (camelCase)',
      variableNameDesc: 'Variable name must be camelCase. For example: firstName, lastName, etc.'
    }
  }
};