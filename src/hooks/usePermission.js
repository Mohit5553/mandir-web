/**
 * usePermission - Permission checker for the admin dashboard.
 *
 * Usage:
 *   const canView   = hasPermission('News', 'view');
 *   const canCreate = hasPermission('News', 'create');
 *   const canUpdate = hasPermission('News', 'update');
 *   const canDelete = hasPermission('News', 'delete');
 */

export const getPermissions = () => {
  try {
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    if (user.role === 'Super Admin') return null; // null = all allowed
    return JSON.parse(localStorage.getItem('adminPermissions') || '[]');
  } catch {
    return [];
  }
};

/**
 * Check if the current user can perform an action on a given menu.
 * @param {string} menu - The menu name, e.g. 'News'
 * @param {'view'|'create'|'update'|'delete'} action
 * @returns {boolean}
 */
export const hasPermission = (menu, action) => {
  const permissions = getPermissions();
  if (permissions === null) return true; // Super Admin: always allowed
  const entry = permissions.find(p => p.menu === menu);
  return entry ? !!entry[action] : false;
};

export const usePermission = (menu, action) => hasPermission(menu, action);
