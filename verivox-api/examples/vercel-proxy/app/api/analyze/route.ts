import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const backendUrl = process.env.HF_BACKEND_URL;
const backendEndpoint = process.env.HF_BACKEND_ENDPOINT || "predict";
const apiSecretKey = process.env.API_SECRET_KEY;

export async function POST(request: NextRequest) {
  if (!backendUrl || !apiSecretKey) {
    return NextResponse.json(
      { detail: "Server is missing HF_BACKEND_URL or API_SECRET_KEY." },
      { status: 500 },
    );
  }

  const incomingForm = await request.formData();
  const file = incomingForm.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { detail: "Missing multipart file field named file." },
      { status: 400 },
    );
  }

  const outgoingForm = new FormData();
  outgoingForm.append("file", file, file.name || "audio.wav");

  const endpoint = backendEndpoint.replace(/^\/+|\/+$/g, "");
  const response = await fetch(`${backendUrl.replace(/\/$/, "")}/${endpoint}`, {
    method: "POST",
    headers: {
      "X-API-Key": apiSecretKey,
    },
    body: outgoingForm,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : { detail: await response.text() };

  return NextResponse.json(body, { status: response.status });
}
