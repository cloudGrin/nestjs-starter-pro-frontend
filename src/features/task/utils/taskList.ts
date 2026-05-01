import type { TaskList } from '../types/task.types';

const taskListScopeLabel: Record<TaskList['scope'], string> = {
  family: '家庭',
  personal: '个人',
};

export function formatTaskListOptionLabel(list: Pick<TaskList, 'name' | 'scope'>) {
  return `${list.name}（${taskListScopeLabel[list.scope]}）`;
}
