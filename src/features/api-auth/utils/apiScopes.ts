import type { DataNode } from 'antd/es/tree';
import type { ApiScopeGroup } from '../types/api-auth.types';

export function buildApiScopeTreeData(groups: ApiScopeGroup[]): DataNode[] {
  return groups.map((group) => ({
    key: group.key,
    title: group.title,
    value: group.key,
    selectable: false,
    disableCheckbox: true,
    children: group.scopes.map((scope) => ({
      key: scope.code,
      title: `${scope.label} (${scope.code})`,
      value: scope.code,
    })),
  }));
}

export function getApiScopeLabel(scopeCode: string, groups: ApiScopeGroup[]): string {
  return findApiScope(scopeCode, groups)?.label ?? scopeCode;
}

export function getApiScopeDescription(scopeCode: string, groups: ApiScopeGroup[]): string {
  return findApiScope(scopeCode, groups)?.description ?? scopeCode;
}

function findApiScope(scopeCode: string, groups: ApiScopeGroup[]) {
  return groups.flatMap((group) => group.scopes).find((scope) => scope.code === scopeCode);
}
