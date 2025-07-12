// app/api/findEcoRoute/route.js
export async function POST(req) {
  try {
    const body = await req.json();

    const flaskResponse = await fetch('http://127.0.0.1:5000/api/eco_route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await flaskResponse.json();

    return new Response(JSON.stringify(data), {
      status: flaskResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Error in /api/findEcoRoute:", err);
    return new Response(JSON.stringify({ error: 'Failed to fetch eco route' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
