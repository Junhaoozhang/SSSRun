import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView        from '@/presentation/views/HomeView.vue'
import SocialView      from '@/presentation/views/SocialView.vue'
import LeaderboardView from '@/presentation/views/LeaderboardView.vue'
import ProfileView     from '@/presentation/views/ProfileView.vue'
import GameView        from '@/presentation/views/GameView.vue'

const router = createRouter({
  history: createWebHashHistory('/SSSRun/'),
  routes: [
    { path: '/',            name: 'home',        component: HomeView },
    { path: '/social',      name: 'social',      component: SocialView },
    { path: '/leaderboard', name: 'leaderboard', component: LeaderboardView },
    { path: '/profile',     name: 'profile',     component: ProfileView },
    { path: '/game',        name: 'game',        component: GameView },
  ],
})

export default router
