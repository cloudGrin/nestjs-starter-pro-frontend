import { describe, expect, it } from 'vitest';
import { generateRoutesWithDefault } from '../generateRoutes';
import { getComponent } from '../componentRegistry';
import { MenuType, type MenuTreeNode } from '@/features/rbac/menu/types/menu.types';

describe('dynamic routing', () => {
  it('resolves backend bootstrap component aliases', () => {
    expect(getComponent('UserListPage')).not.toBeNull();
    expect(getComponent('system/users')).not.toBeNull();
    expect(getComponent('system/roles')).not.toBeNull();
    expect(getComponent('system/menus')).not.toBeNull();
  });

  it('uses the first visible backend menu as the default route', () => {
    const menus: MenuTreeNode[] = [
      {
        id: 1,
        name: '系统管理',
        path: '/system',
        type: MenuType.DIRECTORY,
        sort: 1,
        isActive: true,
        isVisible: true,
        isExternal: false,
        isCache: false,
        createdAt: '',
        updatedAt: '',
        children: [
          {
            id: 2,
            name: '用户管理',
            path: '/system/users',
            type: MenuType.MENU,
            component: 'system/users',
            parentId: 1,
            sort: 1,
            isActive: true,
            isVisible: true,
            isExternal: false,
            isCache: false,
            createdAt: '',
            updatedAt: '',
          },
        ],
      },
    ];

    const routes = generateRoutesWithDefault(menus);

    expect(routes[0]).toMatchObject({ index: true });
    expect((routes[0].element as React.ReactElement).props.to).toBe('/system/users');
  });

  it('does not redirect the index route to itself when no menu can be resolved', () => {
    const routes = generateRoutesWithDefault([]);

    expect(routes[0]).toMatchObject({ index: true });
    expect((routes[0].element as React.ReactElement).props.to).toBeUndefined();
  });
});
