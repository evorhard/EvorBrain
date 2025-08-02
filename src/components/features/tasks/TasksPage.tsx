import type { Component } from 'solid-js';
import { createSignal, onMount, Show } from 'solid-js';
import { useTaskStore } from '../../../stores';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import { Heading } from '../../ui/Heading';
import { Button } from '../../ui/Button';
import { Plus } from 'lucide-solid';
import { Card } from '../../ui/Card';
import { Alert } from '../../ui/Alert';
import LoadingSpinner from '../../ui/LoadingSpinner';

const TasksPage: Component = () => {
  const { store, actions } = useTaskStore();
  const [isFormOpen, setIsFormOpen] = createSignal(false);
  const [editingTask, setEditingTask] = createSignal<string | null>(null);

  onMount(async () => {
    await actions.fetchAll();
  });

  const handleTaskCreate = async (data: {
    project_id?: string;
    parent_task_id?: string;
    title: string;
    description?: string;
    priority?: 'urgent' | 'high' | 'medium' | 'low';
    due_date?: string;
  }) => {
    await actions.create(data);
    setIsFormOpen(false);
  };

  const handleTaskUpdate = async (
    id: string,
    data: {
      project_id?: string;
      parent_task_id?: string;
      title: string;
      description?: string;
      priority: 'urgent' | 'high' | 'medium' | 'low';
      due_date?: string;
    },
  ) => {
    await actions.update(id, data);
    setEditingTask(null);
  };

  const handleTaskComplete = async (id: string) => {
    await actions.complete(id);
  };

  const handleTaskUncomplete = async (id: string) => {
    await actions.uncomplete(id);
  };

  const handleTaskDelete = async (id: string) => {
    await actions.delete(id);
    if (store.selectedId === id) {
      actions.select(null);
    }
  };

  const handleTaskSelect = (id: string) => {
    actions.select(id);
    setEditingTask(null);
  };

  return (
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8 flex items-center justify-between">
        <Heading level={1}>Tasks</Heading>
        <Button onClick={() => setIsFormOpen(true)} leftIcon={<Plus size={20} />}>
          New Task
        </Button>
      </div>

      <Show when={store.error}>
        <Alert variant="error" class="mb-6">
          {store.error}
        </Alert>
      </Show>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <Card>
            <Show
              when={store.isLoading}
              fallback={
                <TaskList
                  tasks={store.items}
                  selectedId={store.selectedId}
                  onSelect={handleTaskSelect}
                  onComplete={handleTaskComplete}
                  onUncomplete={handleTaskUncomplete}
                  onEdit={(id) => setEditingTask(id)}
                  onDelete={handleTaskDelete}
                />
              }
            >
              <div class="flex justify-center p-8">
                <LoadingSpinner size="lg" />
              </div>
            </Show>
          </Card>
        </div>

        <div class="space-y-6">
          <Show when={isFormOpen()}>
            <Card>
              <h2 class="mb-4 text-lg font-semibold">Create Task</h2>
              <TaskForm onSubmit={handleTaskCreate} onCancel={() => setIsFormOpen(false)} />
            </Card>
          </Show>

          <Show when={editingTask()}>
            {(taskId) => {
              const task = store.items.find((t) => t.id === taskId());
              return (
                <Show when={task}>
                  <Card>
                    <h2 class="mb-4 text-lg font-semibold">Edit Task</h2>
                    <TaskForm
                      task={task}
                      onSubmit={(data) => handleTaskUpdate(taskId(), data)}
                      onCancel={() => setEditingTask(null)}
                    />
                  </Card>
                </Show>
              );
            }}
          </Show>

          <Show when={store.selectedId && !editingTask()}>
            {(taskId) => {
              const task = store.items.find((t) => t.id === taskId());
              return (
                <Show when={task}>
                  <TaskDetail
                    task={task!}
                    onEdit={() => setEditingTask(taskId())}
                    onComplete={() => handleTaskComplete(taskId())}
                    onUncomplete={() => handleTaskUncomplete(taskId())}
                    onDelete={() => handleTaskDelete(taskId())}
                  />
                </Show>
              );
            }}
          </Show>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
