
/**
 * Résout l'URL complète d'une image
 * @param {string} path - Le chemin de l'image (relatif ou absolu)
 * @returns {string|null} - L'URL complète ou null
 */
export const getImageUrl = (path) => {
    if (!path) return null;

    // Si c'est déjà une URL complète (http/https ou data:image)
    if (path.startsWith('http') || path.startsWith('data:')) {
        return path;
    }

    // Récupérer l'URL de base de l'API
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    // Extraire la racine (enlever /api à la fin si présent)
    const rootUrl = apiBaseUrl.replace(/\/api\/?$/, '');

    // S'assurer que le path commence par /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Si le path commence par /storage, on suppose que c'est bon
    // Sinon, on pourrait avoir besoin d'ajouter /storage si le backend ne le fait pas
    // Mais généralement le backend renvoie le chemin complet relatif au public ou storage linké

    return `${rootUrl}${cleanPath}`;
};

/**
 * Retourne les initiales d'un nom
 * @param {string} name 
 * @returns {string}
 */
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
