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

export const getRoleStyle = (role) => {
  const normalized = (role || '').toLowerCase().trim();
  
  if (normalized === 'admin' || normalized === 'administrateur') {
    return 'bg-indigo-50 text-indigo-700 border-indigo-100'; // Indigo
  }
  if (normalized === 'assistant') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100'; // Emerald
  }
  if (normalized === 'animateur') {
    return 'bg-amber-50 text-amber-700 border-amber-100'; // Amber
  }
  if (normalized === 'superviseur') {
    return 'bg-blue-50 text-blue-700 border-blue-100'; // Blue
  }
  if (normalized === 'compteur') {
    return 'bg-rose-50 text-rose-700 border-rose-100'; // Rose
  }
  
  // Curated list of premium distinct color palettes for new/custom roles
  // Excludes Indigo, Emerald, Amber, Blue, and Rose to avoid duplicate colors
  const customPalettes = [
    'bg-purple-50 text-purple-700 border-purple-100', // Purple
    'bg-orange-50 text-orange-700 border-orange-100', // Orange
    'bg-teal-50 text-teal-700 border-teal-100',     // Teal
    'bg-cyan-50 text-cyan-700 border-cyan-100',     // Cyan
    'bg-pink-50 text-pink-700 border-pink-100',     // Pink
    'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100', // Fuchsia
    'bg-violet-50 text-violet-700 border-violet-100', // Violet
  ];

  // Compute a simple deterministic hash of the role name string
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Pick an index from the custom palettes array
  const index = Math.abs(hash) % customPalettes.length;
  
  return customPalettes[index];
};

export const getRoleDotColor = (role) => {
  const normalized = (role || '').toLowerCase().trim();
  
  if (normalized === 'admin' || normalized === 'administrateur') {
    return 'bg-indigo-500';
  }
  if (normalized === 'assistant') {
    return 'bg-emerald-500';
  }
  if (normalized === 'animateur') {
    return 'bg-amber-500';
  }
  if (normalized === 'superviseur') {
    return 'bg-blue-500';
  }
  if (normalized === 'compteur') {
    return 'bg-rose-500';
  }
  
  const customColors = [
    'bg-purple-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-fuchsia-500',
    'bg-violet-500',
  ];

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % customColors.length;
  return customColors[index];
};

