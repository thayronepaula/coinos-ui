import { auth, get, post } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export default async ({ cookies, request, url }) => {
	let form = await request.formData();

	let rates = await get('/rates');
	let amount = parseInt(form.get('amount'));
	let request_id = form.get('request_id');
	if (request_id === 'undefined') request_id = undefined;

	let invoice = {
		amount,
		tip: parseInt(form.get('tip')),
		type: form.get('type'),
		prompt: form.get('prompt') === 'true',
		rate: parseFloat(form.get('rate')) || rates[form.get('currency')],
		request_id
	};

	let user = { username: form.get('username'), currency: form.get('currency') };

	invoice = await post('/invoice', { invoice, user }, auth(cookies));
	let { hash } = invoice;

	if (request_id) {
		if (url.pathname.endsWith('tip')) {
			throw redirect(307, `/send/invoice/${hash}`);
		}

		throw redirect(307, `/${user.username}/request/${request_id}`);
	}

	if (invoice.prompt) throw redirect(307, `/${user.username}/invoice/${hash}/tip`);
	else throw redirect(307, `/${user.username}/invoice/${hash}`);
};
