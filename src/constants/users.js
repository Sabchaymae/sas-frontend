export const USER_ROLES = {
  ADMIN: 'admin',
  ASSISTANT: 'assistant',
  ANIMATEUR: 'animateur',
  SUPERVISEUR: 'superviseur',
};

export const USER_STATUS = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  PENDING: 'En attente',
};

export const ROLE_STYLES = {
  [USER_ROLES.ADMIN]: 'bg-purple-50 text-purple-700 border-purple-100',
  [USER_ROLES.ASSISTANT]: 'bg-blue-50 text-blue-700 border-blue-100',
  [USER_ROLES.ANIMATEUR]: 'bg-green-50 text-green-700 border-green-100',
  [USER_ROLES.SUPERVISEUR]: 'bg-orange-50 text-orange-700 border-orange-100',
};

export const STATUS_STYLES = {
  [USER_STATUS.ACTIVE]: 'bg-green-50 text-green-700 border-green-100',
  [USER_STATUS.INACTIVE]: 'bg-gray-50 text-gray-700 border-gray-100',
  [USER_STATUS.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-100',
};
