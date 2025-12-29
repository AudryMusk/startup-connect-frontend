<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav :class="['fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300', navClasses]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 sm:h-20">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink rounded-xl flex items-center justify-center shadow-soft">
              <span class="text-lg sm:text-xl font-black text-white">SC</span>
            </div>
            <span :class="[
              'text-lg sm:text-xl font-bold transition-colors',
              isHeroVisible ? 'text-neutral-900' : 'text-neutral-900',
            ]">StartupConnect</span>
          </div>

          <!-- Vue Desktop -->
          <div class="hidden md:flex items-center gap-8">
            <a href="#features" :class="[
              'font-medium transition-colors',
              isHeroVisible
                ? 'text-neutral-600 hover:text-theme-700'
                : 'text-neutral-600 hover:text-theme-700',
            ]">Fonctionnalités</a>
            <a href="#how-it-works" :class="[
              'font-medium transition-colors',
              isHeroVisible
                ? 'text-neutral-600 hover:text-theme-700'
                : 'text-neutral-600 hover:text-theme-700',
            ]">Comment ça marche</a>
            <a href="#testimonials" :class="[
              'font-medium transition-colors',
              isHeroVisible
                ? 'text-neutral-600 hover:text-theme-700'
                : 'text-neutral-600 hover:text-theme-700',
            ]">Témoignages</a>
            <a href="#contact" :class="[
              'font-medium transition-colors',
              isHeroVisible
                ? 'text-neutral-600 hover:text-theme-700'
                : 'text-neutral-600 hover:text-theme-700',
            ]">Contact</a>
          </div>

          <!-- Boutons CTA -->
          <div class="flex items-center gap-1.5 sm:gap-3">
            <router-link to="/login" :class="[
              'hidden sm:block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all',
              isHeroVisible
                ? 'text-theme-700 hover:bg-theme-50'
                : 'text-neutral-700 hover:bg-neutral-100',
            ]">
              Se connecter
            </router-link>
            <router-link to="/register"
              class="px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2 sm:py-2.5 text-xs sm:text-sm lg:text-base bg-blue-700 text-white font-semibold rounded-lg sm:rounded-xl shadow-soft hover:shadow-soft-lg transition-all hover:scale-105">
              <span class="hidden sm:inline">Commencer</span>
              <span class="sm:hidden">Démarrer</span>
            </router-link>

            <!--  Bouton du menu Mobile-->
            <button @click="mobileMenuOpen = !mobileMenuOpen"
              class="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Menu mobile -->
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-neutral-100">
          <div class="flex flex-col gap-2">
            <a href="#features" @click="mobileMenuOpen = false"
              class="px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Fonctionnalités</a>
            <a href="#how-it-works" @click="mobileMenuOpen = false"
              class="px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Comment ça marche</a>
            <a href="#testimonials" @click="mobileMenuOpen = false"
              class="px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Témoignages</a>
            <a href="#contact" @click="mobileMenuOpen = false"
              class="px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Contact</a>
            <router-link to="/login" class="px-4 py-2 text-theme-700 hover:bg-theme-50 rounded-lg font-medium">Se
              connecter</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Section hero -->
    <section
      class="relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24 overflow-hidden bg-cover bg-center bg-no-repeat min-h-screen flex items-center"
      :style="{ backgroundImage: `url('/startup.jpg')` }">
      <!-- Calque sombre -->
      <div class="absolute inset-0 bg-black/50"></div>

      <!-- Elements d'arrière-plan -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50">
        <div
          class="absolute top-20 -left-20 w-60 sm:w-72 md:w-96 h-60 sm:h-72 md:h-96 bg-brand-purple/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob">
        </div>
        <div
          class="absolute top-40 -right-20 w-60 sm:w-72 md:w-96 h-60 sm:h-72 md:h-96 bg-brand-pink/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000">
        </div>
        <div
          class="absolute -bottom-20 left-1/3 w-60 sm:w-72 md:w-96 h-60 sm:h-72 md:h-96 bg-brand-blue/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000">
        </div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="flex gap-8 sm:gap-12 lg:gap-16 items-center justify-center">
          <div class="text-center lg:text-left max-w-3xl">
            <div
              class="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 text-white rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 animate-fade-in backdrop-blur-sm">
              L'écosystème startup béninois
            </div>

            <h1 ref="heroTitle"
              class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 sm:mb-6 animate-slide-up">
              <span class="typing-text">
                {{ typedBefore }}<span v-if="showStartupColored"
                  class="bg-gradient-to-br from-theme-400 to-theme-600 bg-clip-text text-transparent">{{ typedStartup
                  }}</span>{{ typedAfter }}
              </span><span class="typing-cursor" v-if="isTyping">_</span>
            </h1>

            <p class="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-slide-up"
              style="animation-delay: 0.1s">
              Nous connectons les startups béninoises aux partenaires, investisseurs et
              ressources essentielles pour accélérer leur croissance.
            </p>

            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-slide-up"
              style="animation-delay: 0.2s">
              <router-link to="/register"
                class="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-br from-theme-400 to-theme-600 text-white font-bold rounded-xl shadow-soft-lg hover:shadow-xl transition-all hover:scale-105">
                Créer mon compte
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </router-link>
              <a href="#how-it-works"
                class="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-white text-neutral-700 font-bold rounded-xl border-2 border-neutral-200 hover:bg-theme-100 transition-all">

                Comment ça marche
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="w-5 h-5 sm:w-6 sm:h-6 text-theme-600">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section "confiance" -->
    <section class="py-12 sm:py-16 bg-neutral-50 border-y border-neutral-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-8">
          Ils nous font confiance
        </p>
        <div class="max-w-4xl mx-auto">
          <Carousel :items-to-show="4" :wrap-around="true" :autoplay="2000" class="partner-carousel">
            <Slide v-for="(partner, idx) in partners" :key="idx">
              <a :href="partner.link" target="_blank" rel="noopener" class="flex flex-col items-center group">
                <img :src="partner.logo" class="h-16 w-auto object-contain group-hover: transition duration-100" style="max-width:150px;" />              </a>
            </Slide>
          </Carousel>
        </div>
      </div>
    </section>

    <!-- Section "Fonctionnalités" -->
    <section id="features" class="py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 sm:mb-16">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-brand-purple/10 text-brand-purple rounded-full text-sm font-semibold mb-4">
            Fonctionnalités
          </div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
            Des outils puissants pour développer votre startup et créer des connexions
            significatives
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <!-- Fonctionnalité 1 -->
          <div
            class="group p-6 sm:p-8 bg-white rounded-2xl border border-neutral-100 hover:border-theme-200 hover:shadow-soft-lg transition-all duration-300">
            <div
              class="w-14 h-14 bg-gradient-to-br from-theme-100 to-theme-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-theme-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">Profil Startup</h3>
            <p class="text-neutral-600 leading-relaxed">
              Créez un profil complet pour votre startup avec vos informations, votre équipe et vos
              besoins de financement.
            </p>
          </div>

          <!-- Fonctionnalité 2 -->
          <div
            class="group p-6 sm:p-8 bg-white rounded-2xl border border-neutral-100 hover:border-brand-purple/30 hover:shadow-soft-lg transition-all duration-300">
            <div
              class="w-14 h-14 bg-gradient-to-br from-brand-purple/10 to-brand-purple/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">Offres & Opportunités</h3>
            <p class="text-neutral-600 leading-relaxed">
              Découvrez des offres de partenariat, de financement et d'accompagnement adaptées à
              votre secteur.
            </p>
          </div>

          <!-- Fonctionnalité 3 -->
          <div
            class="group p-6 sm:p-8 bg-white rounded-2xl border border-neutral-100 hover:border-brand-pink/30 hover:shadow-soft-lg transition-all duration-300">
            <div
              class="w-14 h-14 bg-gradient-to-br from-brand-pink/10 to-brand-pink/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-brand-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">Événements</h3>
            <p class="text-neutral-600 leading-relaxed">
              Participez à des événements de networking, pitchs et conférences pour développer votre
              réseau.
            </p>
          </div>

          <!-- Fonctionnalité 4 -->
          <div
            class="group p-6 sm:p-8 bg-white rounded-2xl border border-neutral-100 hover:border-brand-green/30 hover:shadow-soft-lg transition-all duration-300">
            <div
              class="w-14 h-14 bg-gradient-to-br from-brand-green/10 to-brand-green/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">Messagerie</h3>
            <p class="text-neutral-600 leading-relaxed">
              Communiquez directement avec les partenaires et investisseurs via notre messagerie
              intégrée.
            </p>
          </div>

          <!-- Fonctionnalité 5 -->
          <div
            class="group p-6 sm:p-8 bg-white rounded-2xl border border-neutral-100 hover:border-brand-orange/30 hover:shadow-soft-lg transition-all duration-300">
            <div
              class="w-14 h-14 bg-gradient-to-br from-brand-orange/10 to-brand-orange/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">Groupes</h3>
            <p class="text-neutral-600 leading-relaxed">
              Rejoignez des groupes thématiques pour échanger avec d'autres entrepreneurs de votre
              secteur.
            </p>
          </div>

          <!-- Fonctionnalité 6 -->
          <div
            class="group p-6 sm:p-8 bg-white rounded-2xl border border-neutral-100 hover:border-brand-blue/30 hover:shadow-soft-lg transition-all duration-300">
            <div
              class="w-14 h-14 bg-gradient-to-br from-brand-blue/10 to-brand-blue/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg class="w-7 h-7 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">Tableau de bord</h3>
            <p class="text-neutral-600 leading-relaxed">
              Suivez vos candidatures, vos connexions et vos statistiques depuis un tableau de bord
              intuitif.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section "Comment ça marche" -->
    <section id="how-it-works" class="py-16 sm:py-24 bg-gradient-to-br from-neutral-50 to-theme-50/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 sm:mb-16">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-theme-100 text-theme-700 rounded-full text-sm font-semibold mb-4">
            Comment ça marche
          </div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 mb-4">
            Démarrez en 3 étapes simples
          </h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
            Rejoignez l'écosystème en quelques minutes et commencez à développer votre réseau
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 sm:gap-12">
          <!-- Etape 1 -->
          <div class="relative text-center">
            <div
              class="w-16 h-16 bg-gradient-to-br from-theme-500 to-theme-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft-lg">
              <span class="text-2xl font-black text-white">1</span>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">Créez votre compte</h3>
            <p class="text-neutral-600">
              Inscrivez-vous gratuitement en quelques clics et complétez votre profil startup ou
              partenaire.
            </p>
            <!-- Ligne connecteur (ou connectrice (je sais plus trop)) -->
            <div
              class="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-theme-300 to-transparent">
            </div>
          </div>

          <!-- Etape 2 -->
          <div class="relative text-center">
            <div
              class="w-16 h-16 bg-gradient-to-br from-brand-purple to-brand-pink rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft-lg">
              <span class="text-2xl font-black text-white">2</span>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">Explorez les opportunités</h3>
            <p class="text-neutral-600">
              Parcourez les offres de financement, les événements et les partenaires correspondant à
              vos besoins.
            </p>
            <!-- Ligne connect... -->
            <div
              class="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-brand-purple/50 to-transparent">
            </div>
          </div>

          <!-- Etape 3 -->
          <div class="text-center">
            <div
              class="w-16 h-16 bg-gradient-to-br from-brand-green to-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft-lg">
              <span class="text-2xl font-black text-white">3</span>
            </div>
            <h3 class="text-xl font-bold text-neutral-900 mb-3">Développez votre réseau</h3>
            <p class="text-neutral-600">
              Connectez-vous avec des partenaires, participez aux événements et faites grandir votre
              startup.
            </p>
          </div>
        </div>

        <!-- CTA -->
        <div class="text-center mt-12 sm:mt-16">
          <router-link to="/register"
            class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-theme-400 to-theme-600 text-white font-bold rounded-xl shadow-soft-lg hover:shadow-xl transition-all hover:scale-105">
            Commencer maintenant
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Section "Témoignages" -->
    <section id="testimonials" class="py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 sm:mb-16">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 text-brand-green rounded-full text-sm font-semibold mb-4">
            Témoignages
          </div>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p class="text-lg text-neutral-600 max-w-2xl mx-auto">
            Découvrez comment StartupConnect a aidé des entrepreneurs béninois à développer leurs
            projets
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 sm:gap-8">
          <!-- Témoignage 1 -->
          <div
            class="p-6 sm:p-8 bg-white rounded-2xl border border-neutral-100 shadow-soft hover:shadow-soft-lg transition-all">
            <div class="flex items-center gap-1 mb-4">
              <svg v-for="i in 5" :key="i" class="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p class="text-neutral-600 mb-6 leading-relaxed">
              "StartupConnect est une réelle opportunité pour les entrepreneurs béninois. Il s'agit d'un train qu'il ne
              faut pas manquer"
            </p>
            <div class="flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80"
                alt="Jean Koffi" class="w-12 h-12 rounded-full object-cover" />
              <div>
                <div class="font-semibold text-neutral-900">Toundé ADAMAZE</div>
                <div class="text-sm text-neutral-500">Fondateur, Dryl CORP</div>
              </div>
            </div>
          </div>

          <!-- Témoignage 2 -->
          <div
            class="p-6 sm:p-8 bg-white rounded-2xl border border-neutral-100 shadow-soft hover:shadow-soft-lg transition-all">
            <div class="flex items-center gap-1 mb-4">
              <svg v-for="i in 5" :key="i" class="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p class="text-neutral-600 mb-6 leading-relaxed">
              "Les événements organisés via la plateforme m'ont permis de rencontrer des
              entrepreneurs extraordinaires et de créer des partenariats solides."
            </p>
            <div class="flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80"
                alt="Amina Sossa" class="w-12 h-12 rounded-full object-cover" />
              <div>
                <div class="font-semibold text-neutral-900">Bénédicte Gantin</div>
                <div class="text-sm text-neutral-500">CEO, BenDev Solutions</div>
              </div>
            </div>
          </div>

          <!-- Témoignage 3 -->
          <div
            class="p-6 sm:p-8 bg-white rounded-2xl border border-neutral-100 shadow-soft hover:shadow-soft-lg transition-all">
            <div class="flex items-center gap-1 mb-4">
              <svg v-for="i in 5" :key="i" class="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p class="text-neutral-600 mb-6 leading-relaxed">
              "En tant que partenaire, la plateforme me permet d'identifier facilement les startups
              prometteuses qui correspondent à nos critères d'investissement."
            </p>
            <div class="flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80"
                alt="Paul Adjovi" class="w-12 h-12 rounded-full object-cover" />
              <div>
                <div class="font-semibold text-neutral-900">Audry SAHOSSI</div>
                <div class="text-sm text-neutral-500">Directeur, AudryMusk Bénin</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section CTA -->
    <section class="py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden bg-blue-700 rounded-3xl p-8 sm:p-12 lg:p-16">
          <!-- Pattern d'arrière-plan -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div class="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2">
            </div>
          </div>

          <div class="relative text-center">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Prêt à développer votre startup ?
            </h2>
            <p class="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Rejoignez nous et accélérez votre croissance.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <router-link to="/register"
                class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-theme-700 font-bold rounded-xl shadow-soft-lg hover:shadow-xl transition-all hover:scale-105">
                Créer mon compte
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </router-link>
              <router-link to="/login"
                class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all">
                J'ai déjà un compte
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-neutral-900 text-white py-12 sm:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
          <!-- Marque -->
          <div class="sm:col-span-2 lg:col-span-1">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink rounded-xl flex items-center justify-center">
                <span class="text-lg font-black text-white">SC</span>
              </div>
              <span class="text-xl font-bold">StartupConnect</span>
            </div>
            <p class="text-neutral-400 mb-4">
              La plateforme de référence pour l'écosystème startup béninois.
            </p>
            <div class="flex items-center gap-4">
              <a href="#"
                class="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#"
                class="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#"
                class="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          <!-- Liens -->
          <div>
            <h3 class="font-bold text-lg mb-4">Plateforme</h3>
            <ul class="space-y-3">
              <li>
                <a href="#features" class="text-neutral-400 hover:text-white transition-colors">Fonctionnalités</a>
              </li>
              <li>
                <router-link to="/register"
                  class="text-neutral-400 hover:text-white transition-colors">S'inscrire</router-link>
              </li>
              <li>
                <router-link to="/login" class="text-neutral-400 hover:text-white transition-colors">Se
                  connecter</router-link>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold text-lg mb-4">Ressources</h3>
            <ul class="space-y-3">
              <li>
                <a href="#" class="text-neutral-400 hover:text-white transition-colors">Guide de démarrage</a>
              </li>
              <li>
                <a href="#" class="text-neutral-400 hover:text-white transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" class="text-neutral-400 hover:text-white transition-colors">Blog</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold text-lg mb-4">Contact</h3>
            <ul class="space-y-3">
              <li class="flex items-center gap-2 text-neutral-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@startupconnect.bj
              </li>
              <li class="flex items-center gap-2 text-neutral-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Cotonou, Bénin
              </li>
            </ul>
          </div>
        </div>

        <div class="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-neutral-500 text-sm">© {{ this_year() }} StartupConnect. Tous droits réservés.</p>
          <div class="flex items-center gap-6 text-sm">
            <a href="#" class="text-neutral-500 hover:text-white transition-colors">Mentions légales</a>
            <a href="#" class="text-neutral-500 hover:text-white transition-colors">Confidentialité</a>
            <a href="#" class="text-neutral-500 hover:text-white transition-colors">CGU</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Carousel, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

// Logos d'exemple libres de droits (à remplacer par les officiels)
const partners = [
  {
    logo: '/partners/anpe.png',
    link: 'https://anpe.bj',
  },
  {
    logo: '/partners/fda.png',
    link: 'https://www.facebook.com/fdaBenin/?locale=fr_FR',
  },
  {
    logo: '/partners/cma-benin.png',
    link: 'https://cmabenin.bj/',
  },
  {
    logo: '/partners/CCI_Bénin.png',
    link: 'https://www.cci.bj/',
  },
  {
    logo: '/partners/AFD.png',
    link: 'https://www.afd.fr',
  },
  {
    logo: 'partners/Union Européenne.jpg',
    link: 'https://europa.eu',
  },
  {
    logo: '/partners/Sèmè City.png',
    link: 'https://semecity.bj',
  },
]

const this_year = () => {
  const this_date = new Date()
  const year = this_date.getFullYear()

  return year
}

const mobileMenuOpen = ref(false)
const isHeroVisible = ref(true)
const heroTitle = ref(null)
const typedText = ref('')
const isTyping = ref(false)

const fullText = 'Connectez votre startup au succès'
const startupWord = 'startup'
const startupIndex = fullText.indexOf(startupWord)
const endStartupIndex = startupIndex + startupWord.length

let typingInterval = null

// Computed properties pour les parties du texte
const typedBefore = computed(() => typedText.value.substring(0, startupIndex))
const typedStartup = computed(() => typedText.value.substring(startupIndex, Math.min(endStartupIndex, typedText.value.length)))
const typedAfter = computed(() => typedText.value.substring(endStartupIndex))
const showStartupColored = computed(() => typedText.value.length > startupIndex)

const navClasses = computed(() => {
  if (isHeroVisible.value) {
    return 'bg-white border-white shadow-none'
  } else {
    return 'bg-white/80 backdrop-blur-lg border-neutral-100 shadow-soft'
  }
})

// Animation de frappe
const startTyping = () => {
  typedText.value = ''
  isTyping.value = true
  let currentIndex = 0

  if (typingInterval) {
    clearInterval(typingInterval)
  }

  typingInterval = setInterval(() => {
    if (currentIndex < fullText.length) {
      typedText.value += fullText[currentIndex]
      currentIndex++
    } else {
      isTyping.value = false
      clearInterval(typingInterval)
    }
  }, 80) // 80ms par caractère
}

// Detect scroll position to toggle navbar style
const handleScroll = () => {
  const heroSection = document.querySelector('section.relative')
  if (heroSection) {
    const rect = heroSection.getBoundingClientRect()
    isHeroVisible.value = rect.bottom > 100 // Show white bg if hero section is mostly visible
  }
}

// Observer pour détecter quand le titre est visible
let observer = null

onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  // Lancer l'animation au démarrage
  startTyping()

  // Observer pour relancer l'animation quand la section redevient visible
  if (heroTitle.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startTyping()
          }
        })
      },
      { threshold: 0.5 }
    )
    observer.observe(heroTitle.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (typingInterval) {
    clearInterval(typingInterval)
  }
  if (observer && heroTitle.value) {
    observer.unobserve(heroTitle.value)
  }
})
</script>
<style scoped>
.partner-carousel {
  --carousel-slide-width: 160px;
  --carousel-slide-gap: 2rem;
}
.partner-carousel .carousel__slide {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0;
}
.partner-carousel .carousel__track {
  gap: var(--carousel-slide-gap);
}
</style>

<style scoped>
/* Animations */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #1e40af 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Typing animation styles */
.typing-text {
  display: inline;
}

.typing-cursor {
  display: inline;
  color: white;
  animation: blink 0.7s infinite;
  margin-left: 2px;
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}
</style>
