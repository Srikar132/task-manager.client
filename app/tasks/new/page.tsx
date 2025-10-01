'use client';

import { TaskCreateForm } from '@/components/tasks/task-create-form';
import { Layout } from '@/components/layout';

export default function NewTaskPage() {
  return (
    <Layout>
      <TaskCreateForm />
    </Layout>
  );
}

