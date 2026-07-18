import type * as FaceApi from "@vladmandic/face-api";

type FaceApiModule = typeof FaceApi;

let apiPromise: Promise<FaceApiModule> | null = null;
let modelsPromise: Promise<FaceApiModule> | null = null;

const MODEL_URL = "/models";

async function getApi(): Promise<FaceApiModule> {
  if (!apiPromise) apiPromise = import("@vladmandic/face-api");
  return apiPromise;
}

/** Loads the tiny detector + landmark + recognition nets (served from /public/models). Idempotent. */
export async function loadFaceModels(): Promise<FaceApiModule> {
  if (modelsPromise) return modelsPromise;
  modelsPromise = (async () => {
    const faceapi = await getApi();
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    return faceapi;
  })().catch((error) => {
    modelsPromise = null;
    throw error;
  });
  return modelsPromise;
}

export interface EnrolledFace {
  label: string;
  photoUrl: string;
}

/**
 * Builds a FaceMatcher from students' reference photos. Photos must be reachable with CORS
 * (crossorigin anonymous), otherwise that student is skipped. Returns null if none could be enrolled.
 */
export async function buildFaceMatcher(faces: EnrolledFace[]): Promise<FaceApi.FaceMatcher | null> {
  const faceapi = await loadFaceModels();
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
  const labeled: FaceApi.LabeledFaceDescriptors[] = [];

  for (const face of faces) {
    if (!face.photoUrl) continue;
    try {
      const img = await loadImage(face.photoUrl);
      const detection = await faceapi
        .detectSingleFace(img, options)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (detection) {
        labeled.push(new faceapi.LabeledFaceDescriptors(face.label, [detection.descriptor]));
      }
    } catch {
      /* unreachable / no face in photo — skip this student */
    }
  }

  if (!labeled.length) return null;
  // 0.55 is stricter than the 0.6 default to reduce false boardings.
  return new faceapi.FaceMatcher(labeled, 0.55);
}

/** Detects the most prominent face in the video and returns the best matching label, or null. */
export async function matchFace(
  video: HTMLVideoElement,
  matcher: FaceApi.FaceMatcher,
): Promise<string | null> {
  const faceapi = await getApi();
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
  const detection = await faceapi.detectSingleFace(video, options).withFaceLandmarks().withFaceDescriptor();
  if (!detection) return null;
  const best = matcher.findBestMatch(detection.descriptor);
  return best.label === "unknown" ? null : best.label;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = url;
  });
}
