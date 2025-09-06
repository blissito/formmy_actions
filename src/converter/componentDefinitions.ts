import { FrameworkComponent } from './types';

// LlamaIndex Components
export const llamaIndexComponents: FrameworkComponent[] = [
  {
    name: 'VectorStoreIndex',
    framework: 'llamaindex',
    category: 'memory',
    inputs: [
      { name: 'documents', type: 'Document[]', required: true, description: 'Documents to index' },
      { name: 'service_context', type: 'ServiceContext', required: false, description: 'Service context' }
    ],
    outputs: [
      { name: 'index', type: 'VectorStoreIndex', required: true, description: 'Created vector index' }
    ],
    parameters: [
      { name: 'chunk_size', type: 'number', required: false, defaultValue: 1024, description: 'Chunk size for documents' },
      { name: 'chunk_overlap', type: 'number', required: false, defaultValue: 20, description: 'Overlap between chunks' }
    ],
    description: 'Creates a vector store index from documents for semantic search and retrieval'
  },
  {
    name: 'QueryEngine',
    framework: 'llamaindex',
    category: 'processor',
    inputs: [
      { name: 'index', type: 'BaseIndex', required: true, description: 'Index to query' },
      { name: 'query', type: 'string', required: true, description: 'Query text' }
    ],
    outputs: [
      { name: 'response', type: 'Response', required: true, description: 'Query response' }
    ],
    parameters: [
      { name: 'similarity_top_k', type: 'number', required: false, defaultValue: 2, description: 'Number of similar documents to retrieve' },
      { name: 'response_mode', type: 'string', required: false, defaultValue: 'compact', options: ['compact', 'tree_summarize', 'accumulate'] }
    ],
    description: 'Query engine for retrieving and generating responses from indexed data'
  },
  {
    name: 'SimpleDirectoryReader',
    framework: 'llamaindex',
    category: 'input',
    inputs: [
      { name: 'input_dir', type: 'string', required: true, description: 'Directory path to read' }
    ],
    outputs: [
      { name: 'documents', type: 'Document[]', required: true, description: 'Loaded documents' }
    ],
    parameters: [
      { name: 'recursive', type: 'boolean', required: false, defaultValue: false, description: 'Read directories recursively' },
      { name: 'exclude_hidden', type: 'boolean', required: false, defaultValue: true, description: 'Exclude hidden files' }
    ],
    description: 'Reads documents from a directory and converts them to Document objects'
  }
];

// LangChain Components
export const langChainComponents: FrameworkComponent[] = [
  {
    name: 'ChatOpenAI',
    framework: 'langchain',
    category: 'processor',
    inputs: [
      { name: 'messages', type: 'BaseMessage[]', required: true, description: 'Chat messages' }
    ],
    outputs: [
      { name: 'response', type: 'BaseMessage', required: true, description: 'Chat response' }
    ],
    parameters: [
      { name: 'model_name', type: 'string', required: false, defaultValue: 'gpt-3.5-turbo', options: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'] },
      { name: 'temperature', type: 'number', required: false, defaultValue: 0.7, description: 'Sampling temperature' },
      { name: 'max_tokens', type: 'number', required: false, defaultValue: null, description: 'Maximum tokens to generate' }
    ],
    description: 'OpenAI Chat model for conversational AI'
  },
  {
    name: 'PromptTemplate',
    framework: 'langchain',
    category: 'processor',
    inputs: [
      { name: 'variables', type: 'Record<string, any>', required: true, description: 'Template variables' }
    ],
    outputs: [
      { name: 'formatted_prompt', type: 'string', required: true, description: 'Formatted prompt string' }
    ],
    parameters: [
      { name: 'template', type: 'string', required: true, description: 'Prompt template with {variable} placeholders' },
      { name: 'input_variables', type: 'array', required: true, description: 'List of input variable names' }
    ],
    description: 'Template for creating prompts with variable substitution'
  },
  {
    name: 'VectorStore',
    framework: 'langchain',
    category: 'memory',
    inputs: [
      { name: 'documents', type: 'Document[]', required: true, description: 'Documents to store' },
      { name: 'embeddings', type: 'Embeddings', required: true, description: 'Embedding function' }
    ],
    outputs: [
      { name: 'vector_store', type: 'VectorStore', required: true, description: 'Created vector store' }
    ],
    parameters: [
      { name: 'collection_name', type: 'string', required: false, defaultValue: 'default', description: 'Collection name' },
      { name: 'distance_metric', type: 'string', required: false, defaultValue: 'cosine', options: ['cosine', 'euclidean', 'dot'] }
    ],
    description: 'Vector database for storing and retrieving document embeddings'
  },
  {
    name: 'RetrievalQA',
    framework: 'langchain',
    category: 'processor',
    inputs: [
      { name: 'query', type: 'string', required: true, description: 'Question to answer' },
      { name: 'vector_store', type: 'VectorStore', required: true, description: 'Vector store for retrieval' }
    ],
    outputs: [
      { name: 'answer', type: 'string', required: true, description: 'Generated answer' },
      { name: 'source_documents', type: 'Document[]', required: false, description: 'Source documents used' }
    ],
    parameters: [
      { name: 'k', type: 'number', required: false, defaultValue: 4, description: 'Number of documents to retrieve' },
      { name: 'return_source_documents', type: 'boolean', required: false, defaultValue: false, description: 'Return source documents' }
    ],
    description: 'Question-answering chain that retrieves relevant documents and generates answers'
  }
];

export const allComponents = [...llamaIndexComponents, ...langChainComponents];