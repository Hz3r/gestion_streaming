export const PERMISOS = {
  // Clientes
  CLIENTES_VIEW: 'clientes:view',
  CLIENTES_CREATE: 'clientes:create',
  CLIENTES_EDIT: 'clientes:edit',
  CLIENTES_DELETE: 'clientes:delete',

  // Contratos
  CONTRATOS_VIEW: 'contratos:view',
  CONTRATOS_CREATE: 'contratos:create',
  CONTRATOS_EDIT: 'contratos:edit',
  CONTRATOS_DELETE: 'contratos:delete',

  // Cuentas (Streaming)
  CUENTAS_VIEW: 'cuentas:view',
  CUENTAS_CREATE: 'cuentas:create',
  CUENTAS_EDIT: 'cuentas:edit',
  CUENTAS_DELETE: 'cuentas:delete',

  // Lank (Granja)
  LANK_VIEW: 'lank:view',
  LANK_EDIT: 'lank:edit',
  LANK_CLOSE_MONTH: 'lank:close_month',
  LANK_DELETE_HISTORY: 'lank:delete_history',

  // Finanzas
  FINANZAS_VIEW: 'finanzas:view',
  FINANZAS_EXPORT: 'finanzas:export',
  FINANZAS_CLOSE_MONTH: 'finanzas:close_month',

  // Usuarios y Roles
  USUARIOS_MANAGE: 'usuarios:manage',
  ROLES_MANAGE: 'roles:manage',

  // Especial
  ALL: 'all'
} as const;

export type Permiso = typeof PERMISOS[keyof typeof PERMISOS];
