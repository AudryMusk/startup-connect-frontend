import api from './api';

export default {
  /**
   * @param {File} file - File object à uploader
   * @param {string} field - Nom du champ form
   * @returns {Promise} - Retourne {url, path, filename}
   */
  upload(file, field = 'file') {
    const formData = new FormData();
    formData.append(field, file);
    return api.post('/files/upload', formData);
  },

  /**
   * @param {string} path - Chemin du fichier
   * @returns {Promise} - Retourne le blob du fichier
   */
  download(path) {
    return api.get(path, { responseType: 'blob' });
  },

  /**
   * @param {File[]} files - Array de File objects
   * @param {string} field - Nom du champ form (par défaut: 'files')
   * @returns {Promise} - Retourne array d'URLs uploadées
   */
  uploadMultiple(files, field = 'files') {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`${field}[${index}]`, file);
    });
    return api.post('/files/upload-multiple', formData);
  },

  /**
   * Supprimer un fichier
   * @param {string} path
   */
  delete(path) {
    return api.delete('/files/delete', { data: { path } });
  },
};
