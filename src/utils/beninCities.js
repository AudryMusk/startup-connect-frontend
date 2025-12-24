/**
 * Liste complète des communes et villes du Bénin
 * Organisées par département
 */

export const BENIN_CITIES = [
  // Département de l'Alibori
  { name: 'Banikoara', department: 'Alibori' },
  { name: 'Gogounou', department: 'Alibori' },
  { name: 'Kandi', department: 'Alibori' },
  { name: 'Karimama', department: 'Alibori' },
  { name: 'Malanville', department: 'Alibori' },
  { name: 'Ségbana', department: 'Alibori' },

  // Département de l'Atacora
  { name: 'Boukoumbé', department: 'Atacora' },
  { name: 'Cobly', department: 'Atacora' },
  { name: 'Kérou', department: 'Atacora' },
  { name: 'Kouandé', department: 'Atacora' },
  { name: 'Matéri', department: 'Atacora' },
  { name: 'Natitingou', department: 'Atacora' },
  { name: 'Péhunco', department: 'Atacora' },
  { name: 'Tanguiéta', department: 'Atacora' },
  { name: 'Toucountouna', department: 'Atacora' },

  // Département de l'Atlantique
  { name: 'Abomey-Calavi', department: 'Atlantique' },
  { name: 'Allada', department: 'Atlantique' },
  { name: 'Kpomassè', department: 'Atlantique' },
  { name: 'Ouidah', department: 'Atlantique' },
  { name: 'Sô-Ava', department: 'Atlantique' },
  { name: 'Toffo', department: 'Atlantique' },
  { name: 'Tori-Bossito', department: 'Atlantique' },
  { name: 'Zè', department: 'Atlantique' },

  // Département du Borgou
  { name: 'Bembéréké', department: 'Borgou' },
  { name: 'Kalalé', department: 'Borgou' },
  { name: "N'Dali", department: 'Borgou' },
  { name: 'Nikki', department: 'Borgou' },
  { name: 'Parakou', department: 'Borgou' },
  { name: 'Pèrèrè', department: 'Borgou' },
  { name: 'Sinendé', department: 'Borgou' },
  { name: 'Tchaourou', department: 'Borgou' },

  // Département des Collines
  { name: 'Bantè', department: 'Collines' },
  { name: 'Dassa-Zoumè', department: 'Collines' },
  { name: 'Glazoué', department: 'Collines' },
  { name: 'Ouèssè', department: 'Collines' },
  { name: 'Savalou', department: 'Collines' },
  { name: 'Savè', department: 'Collines' },

  // Département du Couffo
  { name: 'Aplahoué', department: 'Couffo' },
  { name: 'Djakotomey', department: 'Couffo' },
  { name: 'Dogbo', department: 'Couffo' },
  { name: 'Klouékanmè', department: 'Couffo' },
  { name: 'Lalo', department: 'Couffo' },
  { name: 'Toviklin', department: 'Couffo' },

  // Département de la Donga
  { name: 'Bassila', department: 'Donga' },
  { name: 'Copargo', department: 'Donga' },
  { name: 'Djougou', department: 'Donga' },
  { name: 'Ouaké', department: 'Donga' },

  // Département du Littoral
  { name: 'Cotonou', department: 'Littoral' },

  // Département du Mono
  { name: 'Athiémé', department: 'Mono' },
  { name: 'Bopa', department: 'Mono' },
  { name: 'Comè', department: 'Mono' },
  { name: 'Grand-Popo', department: 'Mono' },
  { name: 'Houéyogbé', department: 'Mono' },
  { name: 'Lokossa', department: 'Mono' },

  // Département de l'Ouémé
  { name: 'Adjarra', department: 'Ouémé' },
  { name: 'Adjohoun', department: 'Ouémé' },
  { name: 'Aguégués', department: 'Ouémé' },
  { name: 'Akpro-Missérété', department: 'Ouémé' },
  { name: 'Avrankou', department: 'Ouémé' },
  { name: 'Bonou', department: 'Ouémé' },
  { name: 'Dangbo', department: 'Ouémé' },
  { name: 'Porto-Novo', department: 'Ouémé' },
  { name: 'Sèmè-Kpodji', department: 'Ouémé' },

  // Département du Plateau
  { name: 'Adja-Ouèrè', department: 'Plateau' },
  { name: 'Ifangni', department: 'Plateau' },
  { name: 'Kétou', department: 'Plateau' },
  { name: 'Pobè', department: 'Plateau' },
  { name: 'Sakété', department: 'Plateau' },

  // Département du Zou
  { name: 'Abomey', department: 'Zou' },
  { name: 'Agbangnizoun', department: 'Zou' },
  { name: 'Bohicon', department: 'Zou' },
  { name: 'Covè', department: 'Zou' },
  { name: 'Djidja', department: 'Zou' },
  { name: 'Ouinhi', department: 'Zou' },
  { name: 'Za-Kpota', department: 'Zou' },
  { name: 'Zagnanado', department: 'Zou' },
  { name: 'Zogbodomey', department: 'Zou' },
];

/**
 * Liste simplifiée des villes principales (pour select rapide)
 */
export const MAIN_CITIES = [
  'Cotonou',
  'Porto-Novo',
  'Parakou',
  'Abomey-Calavi',
  'Djougou',
  'Bohicon',
  'Natitingou',
  'Lokossa',
  'Ouidah',
  'Abomey',
  'Kandi',
  'Allada',
  'Malanville',
  'Nikki',
  'Savè',
  'Pobè',
  'Kétou',
  'Dassa-Zoumè',
];

/**
 * Départements du Bénin
 */
export const BENIN_DEPARTMENTS = [
  'Alibori',
  'Atacora',
  'Atlantique',
  'Borgou',
  'Collines',
  'Couffo',
  'Donga',
  'Littoral',
  'Mono',
  'Ouémé',
  'Plateau',
  'Zou',
];

/**
 * Obtenir toutes les villes d'un département
 */
export function getCitiesByDepartment(department) {
  return BENIN_CITIES.filter(city => city.department === department);
}

/**
 * Rechercher des villes par nom
 */
export function searchCities(query) {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return BENIN_CITIES.filter(city =>
    city.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtenir les noms de toutes les villes (triés)
 */
export function getAllCityNames() {
  return BENIN_CITIES.map(city => city.name).sort();
}
