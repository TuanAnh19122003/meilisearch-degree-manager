<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { Mail, Lock, Eye, EyeOff } from 'lucide-svelte';

	let email = '';
	let password = '';
	let remember = false;
	let loading = false;
	let message = '';
	let showPassword = false;

	onMount(() => {
		// Kiểm tra nếu đã đăng nhập
		const token = localStorage.getItem('token');
		const user = JSON.parse(localStorage.getItem('user') || '{}');

		if (token && user && Object.keys(user).length) {
			// Redirect nếu đã login
			if (user.role?.code?.toLowerCase() === 'admin') {
				goto('/admin');
			} else {
				goto('/');
			}
		}

		// Nếu chưa login, check remembered login
		const savedLogin = localStorage.getItem('rememberedLogin');
		if (savedLogin) {
			const parsed = JSON.parse(savedLogin);
			email = parsed.email;
			password = parsed.password;
			remember = true;
		}
	});

	const handleLogin = async () => {
		message = '';
		if (!email || !password) {
			message = 'Vui lòng nhập đầy đủ thông tin!';
			return;
		}
		loading = true;
		try {
			const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
				email,
				password
			});

			const { success, token, user, message: msg } = response.data;
			if (!success) {
				message = msg || 'Đăng nhập thất bại!';
				return;
			}

			localStorage.setItem('token', token);
			localStorage.setItem('user', JSON.stringify(user));

			if (remember) {
				localStorage.setItem('rememberedLogin', JSON.stringify({ email, password }));
			} else {
				localStorage.removeItem('rememberedLogin');
			}

			message = msg || 'Đăng nhập thành công!';

			setTimeout(() => {
				if (user.role?.code?.toLowerCase() === 'admin') {
					goto('/admin');
				} else {
					goto('/');
				}
			}, 1000);
		} catch (err) {
			message = err?.response?.data?.message || 'Đăng nhập thất bại!';
		} finally {
			loading = false;
		}
	};
</script>


<div class="min-h-screen flex items-center justify-center bg-gradient-to-br">
	<div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-8">
		<h2 class="text-3xl font-extrabold text-center text-gray-800 mb-8">Đăng nhập</h2>

		<!-- Email input -->
		<div class="mb-4 relative">
			<Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
			<input
				type="email"
				placeholder="Email hoặc tên đăng nhập"
				bind:value={email}
				class="w-full pl-10 p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
			/>
		</div>

		<!-- Password input với ẩn/hiện -->
		<div class="mb-4 relative">
			<Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
			<input
				type={showPassword ? 'text' : 'password'}
				placeholder="Mật khẩu"
				bind:value={password}
				class="w-full pl-10 pr-10 p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
			/>
			<button
				type="button"
				class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
				on:click={() => (showPassword = !showPassword)}
			>
				{#if showPassword}
					<EyeOff class="w-5 h-5"/>
				{:else}
					<Eye class="w-5 h-5"/>
				{/if}
			</button>
		</div>

		<div class="flex justify-between items-center mb-6 text-sm">
			<label class="flex items-center gap-2">
				<input type="checkbox" bind:checked={remember} class="w-4 h-4"/>
				Nhớ mật khẩu
			</label>
			<a href="/" class="text-purple-600 hover:underline">Quên mật khẩu?</a>
		</div>

		<button
			on:click={handleLogin}
			disabled={loading}
			class="w-full p-4 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
		>
			{#if loading}Đang đăng nhập...{/if}
			{#if !loading}Đăng nhập{/if}
		</button>

		{#if message}
			<div class="text-red-600 text-center mt-4 transition-all">{message}</div>
		{/if}

		<div class="text-center mt-6 text-sm text-gray-700">
			<span>Bạn chưa có tài khoản? </span>
			<a href="/auth/register" class="text-purple-600 hover:underline">Đăng ký ngay</a>
		</div>
	</div>
</div>