"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Check, Fingerprint, Keyboard, Nfc, QrCode, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buildFaceMatcher, matchFace } from "@/lib/face-recognition";

export type ScanMethod = "QR" | "NFC" | "FACE" | "FINGERPRINT" | "MANUAL";

export interface ScanResult {
  studentId: number;
  name: string;
  method: string;
  alreadyBoarded: boolean;
}

export interface ScanCandidate {
  studentId: number;
  name: string;
  studentCode?: string;
  photoUrl?: string;
}

type BarcodeDetectorLike = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;
type NdefReadingEvent = { serialNumber?: string };
type NdefReaderLike = {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  addEventListener: (type: "reading" | "readingerror", cb: (event: NdefReadingEvent) => void) => void;
};
type NdefReaderCtor = new () => NdefReaderLike;

const METHODS: { id: ScanMethod; label: string; icon: typeof QrCode; hint: string }[] = [
  { id: "QR", label: "QR code", icon: QrCode, hint: "Scan a student ID card QR with the camera, a handheld scanner, or type the code." },
  { id: "NFC", label: "NFC / RFID", icon: Nfc, hint: "Tap the student's NFC/RFID card. Reader devices that type the tag also work." },
  { id: "FACE", label: "Face", icon: ScanFace, hint: "Point the camera at the student's face — they'll board automatically once recognised." },
  { id: "FINGERPRINT", label: "Fingerprint", icon: Fingerprint, hint: "Use a fingerprint terminal that outputs the matched student's code below." },
  { id: "MANUAL", label: "Manual", icon: Keyboard, hint: "Type or paste a student code, QR value, or tag manually." },
];

const hasBarcodeDetector = () => typeof window !== "undefined" && "BarcodeDetector" in window;
const hasNfc = () => typeof window !== "undefined" && "NDEFReader" in window;

export function ScanBoardDialog({
  open,
  onClose,
  onSubmit,
  students = [],
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string, method: ScanMethod) => Promise<ScanResult | null>;
  students?: ScanCandidate[];
}) {
  const [method, setMethod] = useState<ScanMethod>("QR");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nfcAbort = useRef<AbortController | null>(null);
  const recentRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const matcherRef = useRef<Awaited<ReturnType<typeof buildFaceMatcher>>>(null);
  const submitRef = useRef<(value: string, via: ScanMethod) => Promise<void>>(async () => {});

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  const submit = useCallback(
    async (value: string, via: ScanMethod) => {
      const trimmed = value.trim();
      if (!trimmed || busy) return;
      setBusy(true);
      try {
        const result = await onSubmit(trimmed, via);
        if (result) {
          setLastResult(result);
          setCode("");
          setStatus(null);
          // Previous QR behaviour: stop the camera once a student is successfully boarded.
          if (via === "QR") stopCamera();
        }
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, onSubmit, stopCamera],
  );

  submitRef.current = submit;

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setStatus("Could not open the camera. Check permissions or type the code instead.");
    }
  }, []);

  // Attach the stream once the <video> is actually mounted (fixes black screen).
  useEffect(() => {
    const video = videoRef.current;
    if (!cameraOn || !video || !streamRef.current) return;
    video.srcObject = streamRef.current;
    const played = video.play();
    if (played) played.catch(() => setStatus("Tap the video to start the camera preview."));
  }, [cameraOn]);

  useEffect(() => {
    if (!cameraOn || method !== "QR" || !hasBarcodeDetector()) return;
    const ctor = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector;
    const detector = new ctor({ formats: ["qr_code"] });
    let active = true;
    const timer = setInterval(async () => {
      const video = videoRef.current;
      if (!active || !video || video.readyState < 2) return;
      try {
        const results = await detector.detect(video);
        const value = results[0]?.rawValue?.trim();
        if (!value) return;
        // Keep the camera live; de-dupe the same code so one card boards one student.
        const now = Date.now();
        if (recentRef.current.code === value && now - recentRef.current.at < 3500) return;
        recentRef.current = { code: value, at: now };
        void submit(value, "QR");
      } catch {
        /* transient decode error, keep scanning */
      }
    }, 400);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [cameraOn, method, submit]);

  // Build a face matcher from enrolled student photos when Face mode's camera is on.
  useEffect(() => {
    if (!open || method !== "FACE" || !cameraOn) {
      matcherRef.current = null;
      return;
    }
    let active = true;
    const faces = students
      .filter((s) => s.photoUrl && (s.studentCode || s.studentId))
      .map((s) => ({ label: s.studentCode ?? String(s.studentId), photoUrl: s.photoUrl as string }));
    if (!faces.length) {
      setStatus("No student photos on file — face recognition needs enrolled photos.");
      return;
    }
    setStatus("Loading face recogniser…");
    buildFaceMatcher(faces)
      .then((matcher) => {
        if (!active) return;
        matcherRef.current = matcher;
        setStatus(
          matcher
            ? "Point the camera at the student's face."
            : "Couldn't read any enrolled faces (photos must be public / CORS-enabled).",
        );
      })
      .catch(() => {
        if (active) setStatus("Face recognition failed to load on this device.");
      });
    return () => {
      active = false;
      matcherRef.current = null;
    };
  }, [open, method, cameraOn, students]);

  // Recognition loop: match the live face and board the recognised student.
  useEffect(() => {
    if (!open || method !== "FACE" || !cameraOn) return;
    let active = true;
    const timer = setInterval(async () => {
      const video = videoRef.current;
      const matcher = matcherRef.current;
      if (!active || !video || !matcher || video.readyState < 2) return;
      try {
        const label = await matchFace(video, matcher);
        if (!active || !label) return;
        const now = Date.now();
        if (recentRef.current.code === label && now - recentRef.current.at < 4000) return;
        recentRef.current = { code: label, at: now };
        void submitRef.current(label, "FACE");
      } catch {
        /* keep trying on transient detection errors */
      }
    }, 800);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [open, method, cameraOn]);

  const startNfc = useCallback(async () => {
    if (!hasNfc()) {
      setStatus("Web NFC is not available here (Chrome on Android only). Tap-readers that type the tag still work.");
      return;
    }
    try {
      const reader = new (window as unknown as { NDEFReader: NdefReaderCtor }).NDEFReader();
      const controller = new AbortController();
      nfcAbort.current = controller;
      reader.addEventListener("reading", (event) => {
        if (event.serialNumber) void submit(event.serialNumber, "NFC");
      });
      await reader.scan({ signal: controller.signal });
      setStatus("Hold the student's NFC/RFID card to the phone.");
    } catch {
      setStatus("Could not start NFC scanning.");
    }
  }, [submit]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      nfcAbort.current?.abort();
      nfcAbort.current = null;
      setStatus(null);
      setCode("");
      setLastResult(null);
      recentRef.current = { code: "", at: 0 };
      return;
    }
    inputRef.current?.focus();
  }, [open, stopCamera]);

  useEffect(() => {
    if (!open) return;
    stopCamera();
    nfcAbort.current?.abort();
    nfcAbort.current = null;
    recentRef.current = { code: "", at: 0 };
    setStatus(null);
    if (method === "QR" || method === "FACE") {
      void startCamera();
      if (method === "QR" && !hasBarcodeDetector()) {
        setStatus("This browser can't decode QR from the camera. Use a handheld scanner or type the code.");
      }
    }
    if (method === "NFC" && hasNfc()) void startNfc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, open]);

  const active = METHODS.find((m) => m.id === method)!;

  return (
    <Dialog open={open} onClose={onClose} title="Scan to board">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {METHODS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMethod(item.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition",
                method === item.id
                  ? "border-[var(--primary)] bg-teal-500/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
              )}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-[var(--muted-foreground)]">{active.hint}</p>

      {method === "QR" || method === "FACE" ? (
        <div className="relative mt-4 h-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-black/80">
          <video
            ref={videoRef}
            className={cn("h-56 w-full object-cover", !cameraOn && "hidden")}
            muted
            autoPlay
            playsInline
            onClick={() => videoRef.current?.play().catch(() => undefined)}
          />
          {!cameraOn ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-white/70">
              <CameraOff size={26} />
              Camera off
            </div>
          ) : null}
          {method === "FACE" && cameraOn ? (
            <span className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-1.5 text-center text-xs text-white/80">
              Preview only — enter the code from your face terminal below to board
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {method === "QR" || method === "FACE" ? (
          <Button type="button" variant="outline" onClick={() => (cameraOn ? stopCamera() : startCamera())}>
            {cameraOn ? <CameraOff size={16} /> : <Camera size={16} />}
            {cameraOn ? "Stop camera" : "Start camera"}
          </Button>
        ) : null}
        {method === "NFC" ? (
          <Button type="button" variant="outline" onClick={startNfc}>
            <Nfc size={16} />
            Scan NFC
          </Button>
        ) : null}
        {lastResult ? (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500/15 px-3 py-2 text-sm font-semibold text-[var(--primary)]">
            <Check size={16} />
            {lastResult.alreadyBoarded ? `${lastResult.name} already on board` : `${lastResult.name} marked boarded`}
          </span>
        ) : null}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(code, method);
        }}
      >
        <Input
          ref={inputRef}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Scanned code / student ID"
          autoFocus
          className="flex-1"
        />
        <Button type="submit" disabled={busy || !code.trim()}>
          Board
        </Button>
      </form>

      {status ? <p className="mt-3 text-sm text-[var(--muted-foreground)]">{status}</p> : null}
    </Dialog>
  );
}
