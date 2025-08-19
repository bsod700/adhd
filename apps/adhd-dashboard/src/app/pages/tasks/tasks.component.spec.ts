import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TaskStatus, TaskPriority, TaskDifficulty } from '@adhd-dashboard/shared-types';

import { TasksComponent } from './tasks.component';
import { TasksStore } from '../../stores/tasks.store';

// Mock TasksStore
const mockTasksStore = {
  isLoading: () => false,
  isCreating: () => false,
  error: () => null,
  tasks: () => [],
  loadTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
};

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksComponent, ReactiveFormsModule],
      providers: [
        { provide: TasksStore, useValue: mockTasksStore },
        provideHttpClient(),
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.createTaskForm).toBeDefined();
    expect(component.createTaskForm.get('title')?.value).toBe('');
    expect(component.createTaskForm.get('priority')?.value).toBe(TaskPriority.MEDIUM);
    expect(component.createTaskForm.get('difficulty')?.value).toBe(TaskDifficulty.MEDIUM);
  });

  it('should validate required fields', () => {
    const form = component.createTaskForm;
    
    expect(form.valid).toBeFalsy();
    
    form.patchValue({
      title: 'Test Task',
      priority: TaskPriority.HIGH,
      difficulty: TaskDifficulty.MEDIUM,
      estimatedDuration: 60
    });
    
    expect(form.valid).toBeTruthy();
  });

  it('should create task with valid data', async () => {
    component.createTaskForm.patchValue({
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.HIGH,
      difficulty: TaskDifficulty.MEDIUM,
      estimatedDuration: 60,
      tags: 'work, test'
    });

    await component.onCreateTask();

    expect(mockTasksStore.createTask).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.HIGH,
      difficulty: TaskDifficulty.MEDIUM,
      estimatedDuration: 60,
      tags: ['work', 'test'],
      dueDate: undefined
    });
  });

  it('should not create task with invalid data', async () => {
    component.createTaskForm.patchValue({
      title: '', // Invalid - required
      priority: TaskPriority.LOW
    });

    await component.onCreateTask();

    expect(mockTasksStore.createTask).not.toHaveBeenCalled();
  });

  it('should reset form after successful creation', async () => {
    component.createTaskForm.patchValue({
      title: 'Test Task',
      priority: TaskPriority.HIGH,
      difficulty: TaskDifficulty.MEDIUM
    });

    spyOn(component.createTaskForm, 'reset');
    await component.onCreateTask();

    expect(component.createTaskForm.reset).toHaveBeenCalledWith({ 
      priority: TaskPriority.MEDIUM,
      difficulty: TaskDifficulty.MEDIUM 
    });
  });

  it('should handle task status update', async () => {
    const taskId = 'test-id';
    const newStatus = TaskStatus.COMPLETED;

    await component.onUpdateTaskStatus(taskId, newStatus);

    expect(mockTasksStore.updateTask).toHaveBeenCalledWith(taskId, { status: newStatus });
  });

  it('should handle task deletion with confirmation', async () => {
    const taskId = 'test-id';
    spyOn(window, 'confirm').and.returnValue(true);

    await component.onDeleteTask(taskId);

    expect(mockTasksStore.deleteTask).toHaveBeenCalledWith(taskId);
  });

  it('should not delete task without confirmation', async () => {
    const taskId = 'test-id';
    spyOn(window, 'confirm').and.returnValue(false);

    await component.onDeleteTask(taskId);

    expect(mockTasksStore.deleteTask).not.toHaveBeenCalled();
  });

  it('should return proper error messages', () => {
    const form = component.createTaskForm;
    
    form.get('title')?.markAsTouched();
    form.get('title')?.setErrors({ required: true });
    
    expect(component.getFormFieldError('title')).toBe('title is required');
    
    form.get('title')?.setErrors({ minlength: { requiredLength: 3, actualLength: 2 } });
    expect(component.getFormFieldError('title')).toBe('title is too short');
  });
}); 