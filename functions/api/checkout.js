export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { amount } = await request.json();

    const stripeSecretKey = env.STRIPE_SECRET_KEY;
    const origin = new URL(request.url).origin;

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'gbp',
        'line_items[0][price_data][product_data][name]': 'Indian Spoon Order',
        'line_items[0][price_data][unit_amount]': Math.round(amount * 100),
        'line_items[0][quantity]': 1,
        'mode': 'payment',
        'success_url': `${origin}/success.html`,
        'cancel_url': `${origin}/order.html`,
      }),
    });

    const session = await response.json();
    
    if (session.error) throw new Error(session.error.message);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}