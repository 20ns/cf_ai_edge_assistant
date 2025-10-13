import { AssistantOutput, OperationStatus } from './types';

export class ResponseFormatter {
  static success(
    message: string,
    options?: Partial<Omit<AssistantOutput, 'status' | 'message'>>
  ): AssistantOutput {
    return {
      status: 'success',
      message,
      ...options
    };
  }

  static needsTool(
    message: string,
    options?: Partial<Omit<AssistantOutput, 'status' | 'message'>>
  ): AssistantOutput {
    return {
      status: 'needs_tool',
      message,
      ...options
    };
  }

  static refusal(
    message: string,
    alternatives?: string[]
  ): AssistantOutput {
    return {
      status: 'refusal',
      message,
      next_actions: alternatives
    };
  }

  static error(
    message: string,
    error?: Error
  ): AssistantOutput {
    const errorMessage = error 
      ? `${message}: ${error.message}`
      : message;

    return {
      status: 'error',
      message: errorMessage
    };
  }

  // Parse AI response - falls back to plain message if JSON parsing fails
  static parseAIResponse(aiResponse: string): AssistantOutput {
    try {
      const parsed = JSON.parse(aiResponse);
      
      if (!parsed.status || !parsed.message) {
        throw new Error('Missing required fields: status and message');
      }

      const validStatuses: OperationStatus[] = ['success', 'needs_tool', 'refusal', 'error'];
      if (!validStatuses.includes(parsed.status)) {
        throw new Error(`Invalid status: ${parsed.status}`);
      }

      return parsed as AssistantOutput;
    } catch (error) {
      return {
        status: 'success',
        message: aiResponse
      };
    }
  }

  static toJSON(output: AssistantOutput): string {
    const cleaned: any = {
      status: output.status,
      message: output.message
    };

    if (output.citations && output.citations.length > 0) {
      cleaned.citations = output.citations;
    }

    if (output.tool_calls && output.tool_calls.length > 0) {
      cleaned.tool_calls = output.tool_calls;
    }

    if (output.memory_writes && output.memory_writes.length > 0) {
      cleaned.memory_writes = output.memory_writes;
    }

    if (output.next_actions && output.next_actions.length > 0) {
      cleaned.next_actions = output.next_actions;
    }

    return JSON.stringify(cleaned, null, 2);
  }

  static toText(output: AssistantOutput): string {
    let text = output.message;

    if (output.citations && output.citations.length > 0) {
      text += '\n\nSources:\n';
      output.citations.forEach(citation => {
        text += `- ${citation.title}: ${citation.source}\n`;
      });
    }

    if (output.next_actions && output.next_actions.length > 0) {
      text += '\n\nNext steps:\n';
      output.next_actions.forEach(action => {
        text += `- ${action}\n`;
      });
    }

    return text;
  }
}
