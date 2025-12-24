import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFeedStore = defineStore('feed', () => {
  // État
  const posts = ref([])
  const nextEventDate = ref(null)
  const loading = ref(false)

  // Actions
  const addPost = (post) => {
    const newPost = {
      id: `post_${Date.now()}`,
      ...post,
      createdAt: new Date().toISOString(),
      comments: [],
    }
    posts.value.unshift(newPost)
    savePosts()
    return newPost
  }

  const updatePost = (postId, updatedData) => {
    const index = posts.value.findIndex((p) => p.id === postId)
    if (index !== -1) {
      posts.value[index] = { ...posts.value[index], ...updatedData }
      savePosts()
    }
  }

  const deletePost = (postId) => {
    posts.value = posts.value.filter((p) => p.id !== postId)
    savePosts()
  }

  const addComment = (postId, comment) => {
    const post = posts.value.find((p) => p.id === postId)
    if (post) {
      if (!post.comments) post.comments = []
      post.comments.push({
        id: `comment_${Date.now()}`,
        ...comment,
        createdAt: Date.now(),
      })
      savePosts()
    }
  }

  const deleteComment = (postId, commentId) => {
    const post = posts.value.find((p) => p.id === postId)
    if (post && post.comments) {
      post.comments = post.comments.filter((c) => c.id !== commentId)
      savePosts()
    }
  }

  const setNextEventDate = (date) => {
    nextEventDate.value = date
    localStorage.setItem('startup_connect_next_event', JSON.stringify(date))
  }

  const clearNextEventDate = () => {
    nextEventDate.value = null
    localStorage.removeItem('startup_connect_next_event')
  }

  const loadPosts = () => {
    try {
      const stored = localStorage.getItem('startup_connect_posts')
      if (stored) {
        posts.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
      posts.value = []
    }
  }

  const savePosts = () => {
    try {
      localStorage.setItem('startup_connect_posts', JSON.stringify(posts.value))
    } catch (error) {
      console.error('Error saving posts:', error)
    }
  }

  const loadNextEventDate = () => {
    try {
      const stored = localStorage.getItem('startup_connect_next_event')
      if (stored) {
        nextEventDate.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading event date:', error)
      nextEventDate.value = null
    }
  }

  // Initialisation
  loadPosts()
  loadNextEventDate()

  return {
    posts,
    nextEventDate,
    loading,
    addPost,
    updatePost,
    deletePost,
    addComment,
    deleteComment,
    setNextEventDate,
    clearNextEventDate,
    loadPosts,
  }
})
