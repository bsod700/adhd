import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TasksStore } from '../../stores/tasks.store';
import { Task, TaskStatus, TaskPriority, TaskDifficulty, CreateTaskDto } from '@adhd-dashboard/shared-types';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksComponent implements OnInit {
  protected readonly tasksStore = inject(TasksStore);
  private readonly fb = inject(FormBuilder);

  readonly TaskStatus = TaskStatus;
  readonly Priority = TaskPriority;
  readonly Difficulty = TaskDifficulty;

  createTaskForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    priority: [TaskPriority.MEDIUM, [Validators.required]],
    difficulty: [TaskDifficulty.MEDIUM, [Validators.required]],
    dueDate: [''],
    estimatedDuration: ['', [Validators.min(1), Validators.max(480)]], // max 8 hours
    tags: ['']
  });

  ngOnInit(): void {
    // Only load tasks in browser environment
    if (typeof window !== 'undefined') {
      void this.loadTasks();
    }
  }

  async loadTasks(): Promise<void> {
    try {
      await this.tasksStore.loadTasks();
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }

  async onCreateTask(): Promise<void> {
    if (this.createTaskForm.valid) {
      const formValue = this.createTaskForm.value;
      const taskData: CreateTaskDto = {
        title: formValue.title.trim(),
        description: formValue.description?.trim(),
        priority: formValue.priority,
        difficulty: formValue.difficulty,
        estimatedDuration: formValue.estimatedDuration || 30, // Default 30 minutes
        tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : [],
        ...(formValue.dueDate && { dueDate: new Date(formValue.dueDate) })
      };

      try {
        await this.tasksStore.createTask(taskData);
        this.createTaskForm.reset({ 
          priority: TaskPriority.MEDIUM, 
          difficulty: TaskDifficulty.MEDIUM 
        });
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    }
  }

  async onUpdateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    try {
      await this.tasksStore.updateTask(taskId, { status });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  onStatusSelectChange(taskId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target?.value) {
      void this.onUpdateTaskStatus(taskId, target.value as TaskStatus);
    }
  }

  async onDeleteTask(taskId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await this.tasksStore.deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  }

  /**
   * Track by function for task list performance optimization
   */
  trackByTaskId = (_: number, task: Task): string => task.id;

  getFormFieldError(fieldName: string): string | null {
    const field = this.createTaskForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['maxlength']) return `${fieldName} is too long`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must be at most ${field.errors['max'].max}`;
    }
    return null;
  }
} 