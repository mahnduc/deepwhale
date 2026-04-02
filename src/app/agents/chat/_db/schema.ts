// db/schema.ts
export const messageSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    agent_id: { type: 'string', maxLength: 100 },
    role: { type: 'string', enum: ['user', 'assistant', 'system'] },
    content: { type: 'string' },
    timestamp: { type: 'number', index: true }
  },
  required: ['id', 'agent_id', 'role', 'content', 'timestamp']
};