import api from './api';

export default {
  /**
   * Récupérer le formulaire par défaut
   * @returns {Promise} - Retourne le formulaire par défaut
   */
  getDefault() {
    return api.get('/forms/default');
  },

  /**
   * Créer un nouveau formulaire
   * @param {Object} payload - {name, description, fields: [...]}
   * @returns {Promise} - Retourne l'objet formulaire créé
   */
  create(payload) {
    return api.post('/forms', payload);
  },

  /**
   * Dupliquer un formulaire existant
   * @param {number} id - Form ID
   * @param {Object} payload - {name: string}
   * @returns {Promise} - Retourne le nouveau formulaire
   */
  duplicate(id, payload = {}) {
    return api.post(`/forms/${id}/duplicate`, payload);
  },

  /**
   * Récupérer un formulaire par id
   * @param {number} id - Form ID
   * @returns {Promise} - Retourne l'objet formulaire avec fields
   */
  get(id) {
    return api.get(`/forms/${id}`);
  },

  /**
   * Lister tous les formulaires
   * @param {Object} params
   * @returns {Promise} - Retourne array de formulaires
   */
  list(params = {}) {
    return api.get('/forms', { params });
  },

  /**
   * Mettre à jour un formulaire
   * @param {number} id - Form ID
   * @param {Object} payload - Données à modifier
   */
  update(id, payload) {
    return api.put(`/forms/${id}`, payload);
  },

  /**
   * Supprimer un formulaire
   * @param {number} id - Form ID
   */
  delete(id) {
    return api.delete(`/forms/${id}`);
  },

  /**
   * Ajouter un champ à un formulaire
   * @param {number} formId - Form ID
   * @param {Object} fieldData - Données du champ
   */
  addField(formId, fieldData) {
    return api.post(`/forms/${formId}/fields`, fieldData);
  },

  /**
   * Mettre à jour un champ
   * @param {number} formId - Form ID
   * @param {number} fieldId - Field ID
   * @param {Object} fieldData - Données à modifier
   */
  updateField(formId, fieldId, fieldData) {
    return api.put(`/forms/${formId}/fields/${fieldId}`, fieldData);
  },

  /**
   * Supprimer un champ
   * @param {number} formId - Form ID
   * @param {number} fieldId - Field ID
   */
  deleteField(formId, fieldId) {
    return api.delete(`/forms/${formId}/fields/${fieldId}`);
  },

  /**
   * Réordonner les champs d'un formulaire
   * @param {number} formId - Form ID
   * @param {Object} fields - {fieldId: order, ...}
   */
  reorderFields(formId, fields) {
    return api.post(`/forms/${formId}/fields/reorder`, { fields });
  },

  /**
   * Soumettre un formulaire avec réponses et fichiers
   * @param {number} id - Form ID
   * @param {Object} data - {answers: [...], files: [...]}
   * @returns {Promise} - Retourne la soumission enregistrée
   */
  submit(id, data) {
    const formData = new FormData();
    // Ajouter les réponses au formulaire sous forme JSON
    formData.append('answers', JSON.stringify(data.answers));
    // Ajouter les fichiers si présents
    if (data.files && data.files.length > 0) {
      data.files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
    }
    return api.post(`/forms/${id}/submit`, formData);
  },

  /**
   * Récupérer les soumissions d'un formulaire
   * @param {number} id - Form ID
   * @param {Object} params - {page, per_page}
   */
  getSubmissions(id, params = {}) {
    return api.get(`/forms/${id}/submissions`, { params });
  },

  /**
   * Récupérer une soumission spécifique
   * @param {number} formId - Form ID
   * @param {number} submissionId - Submission ID
   */
  getSubmission(formId, submissionId) {
    return api.get(`/forms/${formId}/submissions/${submissionId}`);
  },
};

