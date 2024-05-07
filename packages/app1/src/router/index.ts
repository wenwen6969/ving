import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '../pages/login/index.vue';

const routes = [
	{
		path: '/',
		component: Login,
	},
];

export const router = createRouter({
	history: createWebHashHistory(),
	routes: routes,
});

export default router;
