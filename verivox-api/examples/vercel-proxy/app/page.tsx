export default function Page() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", margin: "48px auto", maxWidth: 720, padding: 24 }}>
      <h1>VeriVox Vercel Proxy</h1>
      <p>
        This small Next.js app exposes <code>POST /api/analyze</code> and forwards uploads
        to the Hugging Face backend with <code>X-API-Key</code> added server-side.
      </p>
      <p>
        Configure <code>HF_BACKEND_URL</code> and <code>API_SECRET_KEY</code> in Vercel before deploying.
      </p>
    </main>
  );
}
