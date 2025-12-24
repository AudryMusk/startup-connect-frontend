import { createRouter, createWebHistory } from 'vue-router'

// Landing page
import LandingPage from './pages/LandingPage.vue'

// Pages d'authentification
import LoginPage from './pages/auth/LoginPage.vue'
import RegisterPage from './pages/auth/RegisterPage.vue'
import OnboardingFinalizePage from './pages/auth/OnboardingFinalizePage.vue'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.vue'
import ResetPasswordPage from './pages/auth/ResetPasswordPage.vue'

// Pages d'accueil (par profile)
import StartuperHomePage from './pages/home/StartuperHomePage.vue'
import PartnerHomePage from './pages/home/PartnerHomePage.vue'
import AdminHomePage from './pages/home/AdminHomePage.vue'

// Pages d'offres
import OffersPage from './pages/offers/OffersPage.vue'
import CreateOfferPage from './pages/offers/CreateOfferPage.vue'
import EditOfferPage from './pages/offers/EditOfferPage.vue'
import OfferDetailPage from './pages/offers/OfferDetailPage.vue'

// Pages d'événements
import EventsPage from './pages/events/EventsPage.vue'
import CreateEventPage from './pages/events/CreateEventPage.vue'
import EventDetailPage from './pages/events/EventDetailPage.vue'

// Home redirecteur selon rôle
import HomeRedirect from './pages/home/HomeRedirect.vue'

// Pages de startups
import StartupsPage from './pages/startups/StartupsPage.vue'
import StartupDetailPage from './pages/startups/StartupDetailPage.vue'
import ConnectionRequestsPage from './pages/startups/ConnectionRequestsPage.vue'

// Pages de messages & groupes
import MessagingHub from './pages/messages/MessagingHub.vue'

// Page d'administration
import AdminHub from './pages/admin/AdminHub.vue'
import AdminPage from './pages/admin/AdminPage.vue'
import ModerationPage from './pages/admin/ModerationPage.vue'
import RCCMValidationPage from './pages/admin/RCCMValidationPage.vue'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.vue'
import AdminUsersPage from './pages/admin/AdminUsersPage.vue'
import AdminStartupsPage from './pages/admin/AdminStartupsPage.vue'
import AdminLogsPage from './pages/admin/AdminLogsPage.vue'

// Pages d'organisations
import OrganizationDetailPage from './pages/organizations/OrganizationDetailPage.vue'

// Page de notifications
import NotificationsPage from './pages/notifications/NotificationsPage.vue'

// Pages startuper
import MyCandidaciesPage from './pages/candidacies/MyCandidaciesPage.vue'
import ApplicationDetailPage from './pages/candidacies/ApplicationDetailPage.vue'

// Pages partenaire
import PartnerStatsPage from './pages/partner/PartnerStatsPage.vue'
import MyOffersPage from './pages/partner/MyOffersPage.vue'
import ApplicationsReceivedPage from './pages/partner/ApplicationsReceivedPage.vue'
import MyFormsPage from './pages/partner/MyFormsPage.vue'
import FormBuilderPage from './pages/partner/FormBuilderPage.vue'
import FormViewPage from './pages/partner/FormViewPage.vue'

// Pages posts
import PostDetailPage from '@/pages/posts/PostDetailPage.vue'
import UserProfilePage from '@/pages/users/UserProfilePage.vue'
import EditProfilePage from '@/pages/users/EditProfilePage.vue'

const routes = [
  // Landing page publique
  { path: '/welcome', name: 'Landing', component: LandingPage },

  // Routes publiques
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  { path: '/onboarding-finalize', name: 'OnboardingFinalize', component: OnboardingFinalizePage },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordPage },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPasswordPage },

  // Routes de raccourci pour accéder aux pages de profil
  {
    path: '/startup',
    name: 'StartupHome',
    component: StartuperHomePage,
    meta: { requiresLayout: true },
  },
  {
    path: '/partner',
    name: 'PartnerHome',
    component: PartnerHomePage,
    meta: { requiresLayout: true },
  },
  {
    path: '/admin-home',
    name: 'AdminHome',
    component: AdminHomePage,
    meta: { requiresLayout: true },
  },

  // Routes protégées
  // Route racine redirige dynamiquement selon le rôle de l'utilisateur
  { path: '/', name: 'Home', component: HomeRedirect, meta: { requiresLayout: true } },
  { path: '/startups', name: 'Startups', component: StartupsPage, meta: { requiresLayout: true } },
  {
    path: '/startups/:id',
    name: 'StartupDetail',
    component: StartupDetailPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/connections',
    name: 'Connections',
    component: ConnectionRequestsPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/organizations/:id',
    name: 'OrganizationDetail',
    component: OrganizationDetailPage,
    meta: { requiresLayout: true },
  },
  { path: '/offers', name: 'Offers', component: OffersPage, meta: { requiresLayout: true } },
  {
    path: '/offers/create',
    name: 'CreateOffer',
    component: CreateOfferPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/offers/:id/edit',
    name: 'EditOffer',
    component: EditOfferPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/offers/:id',
    name: 'OfferDetail',
    component: OfferDetailPage,
    meta: { requiresLayout: true },
  },
  { path: '/events', name: 'Events', component: EventsPage, meta: { requiresLayout: true } },
  {
    path: '/events/create',
    name: 'CreateEvent',
    component: CreateEventPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/events/:id',
    name: 'EventDetail',
    component: EventDetailPage,
    meta: { requiresLayout: true },
  },
  // Messages & Groupes - Hub unifié avec onglets
  { path: '/messages', name: 'Messages', component: MessagingHub, meta: { requiresLayout: true } },
  { path: '/conversations', redirect: '/messages?tab=conversations' },
  { path: '/groups', redirect: '/messages?tab=groups' },

  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationsPage,
    meta: { requiresLayout: true },
  },

  // Applications / Candidatures
  {
    path: '/applications/:id',
    name: 'ApplicationDetail',
    component: ApplicationDetailPage,
    meta: { requiresLayout: true },
  },

  { path: '/admin', redirect: '/admin/dashboard' },

  // Routes admin avec layout
  {
    path: '/admin',
    component: AdminHub,
    meta: { requiresLayout: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboardPage,
      },
      {
        path: 'moderation',
        name: 'Moderation',
        component: ModerationPage,
      },
      {
        path: 'rccm-validation',
        name: 'RCCMValidation',
        component: RCCMValidationPage,
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsersPage,
      },
      {
        path: 'startups',
        name: 'AdminStartups',
        component: AdminStartupsPage,
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: AdminLogsPage,
      },
    ],
  },

  // Routes posts
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: PostDetailPage,
    meta: { requiresLayout: true },
  },

  // Routes profils utilisateurs
  {
    path: '/users/:id',
    name: 'UserProfile',
    component: UserProfilePage,
    meta: { requiresLayout: true },
  },
  {
    path: '/profile/edit',
    name: 'EditProfile',
    component: EditProfilePage,
    meta: { requiresLayout: true },
  },

  // Routes startuper
  { path: '/startuper/home', redirect: '/startup' },
  {
    path: '/candidacies',
    name: 'MyCandidacies',
    component: MyCandidaciesPage,
    meta: { requiresLayout: true },
  },

  // Routes partenaire
  { path: '/partner/home', redirect: '/partner' },
  {
    path: '/partner/stats',
    name: 'PartnerStats',
    component: PartnerStatsPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/partner/offers',
    name: 'MyOffers',
    component: MyOffersPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/partner/applications',
    name: 'ApplicationsReceived',
    component: ApplicationsReceivedPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/partner/offers/:id/applications',
    name: 'OfferApplications',
    component: ApplicationsReceivedPage,
    meta: { requiresLayout: true },
    props: true,
  },
  {
    path: '/partner/forms',
    name: 'MyForms',
    component: MyFormsPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/partner/forms/create',
    name: 'CreateForm',
    component: FormBuilderPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/partner/forms/:id',
    name: 'ViewForm',
    component: FormViewPage,
    meta: { requiresLayout: true },
  },
  {
    path: '/partner/forms/:id/edit',
    name: 'EditForm',
    component: FormBuilderPage,
    meta: { requiresLayout: true },
  },
  { path: '/partner/offers/create', redirect: '/offers/create' },

  // Toutes les autres routes redirigent vers la page d'accueil
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard pour protéger les routes authentifiées
router.beforeEach((to, from, next) => {
  // Routes publiques qui ne nécessitent pas d'authentification
  const publicPages = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/welcome',
  ]
  const authRequired = !publicPages.includes(to.path)

  // Vérifier le token dans le localStorage
  const token = localStorage.getItem('auth_token')

  // Si la route nécessite une authentification
  if (authRequired && !token) {
    // Bloquer toute navigation vers les pages protégées
    // Ne pas permettre de retour en arrière sans token
    console.log('[Router Guard] Accès refusé - Pas de token')
    return next({
      path: '/welcome',
      query: { redirect: to.fullPath },
      replace: true, // Remplacer l'historique pour empêcher le retour
    })
  }

  // Si l'utilisateur est connecté et essaie d'accéder aux pages d'auth (sauf landing)
  if (!authRequired && token && to.path !== '/welcome') {
    return next({ path: '/', replace: true })
  }

  next()
})

// Guard supplémentaire pour détecter les changements de localStorage (logout)
window.addEventListener('storage', (e) => {
  if (e.key === 'auth_token' && !e.newValue) {
    // Token supprimé = déconnexion détectée
    console.log('[Storage Event] Token supprimé - Redirection vers login')
    window.location.href = '/login'
  }
})

export default router
