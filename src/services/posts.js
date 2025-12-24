import api from './api'

export default {
  /**
   *  tous les posts
   * @param {Object} params - {page, per_page, startup_id, author_id}
   */
  list(params = {}) {
    return api.get('/posts', { params })
  },

  /**
   *  les détails d'un post
   * @param {number} id - Post ID
   */
  get(id) {
    return api.get(`/posts/${id}`)
  },

  /**
   *  un nouveau post
   * @param {Object|FormData} payload - Données du post (title, content, images, etc.)
   */
  create(payload) {
    // Si déjà FormData, l'envoyer directement
    if (payload instanceof FormData) {
      return api.post('/posts', payload)
    }

    // Sinon, convertir en FormData
    const formData = new FormData()
    Object.keys(payload).forEach((key) => {
      if (Array.isArray(payload[key])) {
        payload[key].forEach((item, index) => {
          formData.append(`${key}[${index}]`, item)
        })
      } else {
        formData.append(key, payload[key])
      }
    })
    return api.post('/posts', formData)
  },

  /**
   * Mettre à jour un post
   * @param {number} id - Post ID
   * @param {Object|FormData} payload - Données à modifier
   */
  update(id, payload) {
    // Si déjà FormData, ajouter _method pour le spoofing Laravel
    if (payload instanceof FormData) {
      payload.append('_method', 'PUT')
      return api.post(`/posts/${id}`, payload)
    }

    // Si payload contient des images (fichiers), utiliser FormData
    if (payload.images && payload.images.length > 0 && payload.images[0] instanceof File) {
      const formData = new FormData()
      formData.append('_method', 'PUT')

      // Ajouter les champs texte
      if (payload.title !== undefined) formData.append('title', payload.title)
      if (payload.content !== undefined) formData.append('content', payload.content)

      // Ajouter les nouvelles images
      payload.images.forEach((file) => {
        formData.append('images[]', file)
      })

      // Ajouter les IDs des images existantes à conserver
      if (payload.existing_images && payload.existing_images.length > 0) {
        payload.existing_images.forEach((imageId) => {
          formData.append('existing_images[]', imageId)
        })
      }

      return api.post(`/posts/${id}`, formData)
    }

    // Sinon, utiliser PUT classique pour les mises à jour sans images
    return api.put(`/posts/${id}`, payload)
  },

  /**
   * Supprimer un post
   * @param {number} id - Post ID
   */
  delete(id) {
    return api.delete(`/posts/${id}`)
  },

  /**
   * Commenter un post
   * @param {number} postId - Post ID
   * @param {Object} payload - {content, parent_id?} (parent_id pour une réponse)
   */
  comment(postId, payload) {
    return api.post(`/posts/${postId}/comments`, payload)
  },

  /**
   * Lister les commentaires d'un post (racines uniquement)
   * @param {number} postId - Post ID
   * @param {Object} params - {page, per_page}
   */
  getComments(postId, params = {}) {
    return api.get(`/posts/${postId}/comments`, { params })
  },

  /**
   * Lister les réponses d'un commentaire
   * @param {number} commentId - Comment ID
   * @param {Object} params - {page, per_page}
   */
  getReplies(commentId, params = {}) {
    return api.get(`/comments/${commentId}/replies`, { params })
  },

  /**
   * Modifier un commentaire
   * @param {number} commentId - Comment ID
   * @param {Object} payload - {content}
   */
  updateComment(commentId, payload) {
    return api.put(`/comments/${commentId}`, payload)
  },

  /**
   * Supprimer un commentaire
   * @param {number} commentId - Comment ID
   */
  deleteComment(commentId) {
    return api.delete(`/comments/${commentId}`)
  },
}
