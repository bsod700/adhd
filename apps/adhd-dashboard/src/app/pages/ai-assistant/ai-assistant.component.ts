import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ChatMessage {
  readonly id: string;
  readonly type: 'user' | 'ai';
  readonly content: string;
  readonly timestamp: Date;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiAssistantComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly messages = signal<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hi! I\'m your AI assistant for ADHD productivity. How can I help you today?',
      timestamp: new Date()
    }
  ]);

  readonly isTyping = signal(false);

  readonly chatForm: FormGroup = this.formBuilder.group({
    message: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit(): void {
    this.initializeAssistant();
  }

  async onSendMessage(): Promise<void> {
    if (!this.chatForm.valid) return;

    const messageText = this.getMessageText();
    if (!messageText) return;

    this.addUserMessage(messageText);
    this.chatForm.reset();
    
    await this.processAiResponse(messageText);
  }

  onQuickAction(actionType: string): void {
    const aiMessage = this.createQuickActionMessage(actionType);
    this.addAiMessage(aiMessage);
  }

  private initializeAssistant(): void {
    // Initialize any required services or data
    console.warn('AI Assistant initialized');
  }

  private getMessageText(): string {
    return this.chatForm.get('message')?.value?.trim() || '';
  }

  private addUserMessage(content: string): void {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    this.messages.update(messages => [...messages, userMessage]);
  }

  private addAiMessage(content: string): void {
    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date()
    };

    this.messages.update(messages => [...messages, aiMessage]);
  }

  private async processAiResponse(userMessage: string): Promise<void> {
    this.isTyping.set(true);

    // Simulate API call delay
    await this.simulateApiDelay();

    const responseContent = this.generateIntelligentResponse(userMessage);
    this.addAiMessage(responseContent);
    this.isTyping.set(false);
  }

  private async simulateApiDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1500));
  }

  private generateIntelligentResponse(userMessage: string): string {
    const messageLower = userMessage.toLowerCase();
    
    if (this.isTaskRelated(messageLower)) {
      return this.getTaskAdvice();
    }
    
    if (this.isFocusRelated(messageLower)) {
      return this.getFocusAdvice();
    }
    
    if (this.isEnergyRelated(messageLower)) {
      return this.getEnergyAdvice();
    }
    
    if (this.isMotivationRelated(messageLower)) {
      return this.getMotivationAdvice();
    }
    
    return this.getGeneralAdvice();
  }

  private createQuickActionMessage(actionType: string): string {
    const actionResponses: Record<string, string> = {
      'energy-check': 'How are you feeling right now? Rate your energy from 1-10.',
      'task-suggestions': 'Based on your current energy level, here are some recommended tasks...',
      'focus-tips': 'Try the Pomodoro Technique: 25 minutes focused work, 5 minutes break.',
      'break-reminder': 'It\'s time for a break! Step away from your screen for 5-10 minutes.'
    };

    return actionResponses[actionType] || 'How can I help you today?';
  }

  private isTaskRelated(message: string): boolean {
    return message.includes('task') || message.includes('todo');
  }

  private isFocusRelated(message: string): boolean {
    return message.includes('focus') || message.includes('concentration');
  }

  private isEnergyRelated(message: string): boolean {
    return message.includes('energy') || message.includes('tired');
  }

  private isMotivationRelated(message: string): boolean {
    return message.includes('procrastination') || message.includes('motivation');
  }

  private getTaskAdvice(): string {
    return 'Break large tasks into 15-25 minute chunks. This works especially well for ADHD brains and prevents overwhelm.';
  }

  private getFocusAdvice(): string {
    return 'Try eliminating distractions, using background music, and taking regular breaks. The 45-minute work, 15-minute break cycle often works well.';
  }

  private getEnergyAdvice(): string {
    return 'Track your natural energy patterns and schedule important tasks during peak hours. Stay hydrated and take movement breaks.';
  }

  private getMotivationAdvice(): string {
    return 'Use the "2-minute rule" - if something takes less than 2 minutes, do it now. For bigger tasks, commit to just 5 minutes to start.';
  }

  private getGeneralAdvice(): string {
    return 'I\'m here to help with productivity strategies, task management, and ADHD-friendly techniques. What specific area interests you?';
  }
} 