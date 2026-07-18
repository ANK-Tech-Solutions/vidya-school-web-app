"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Fingerprint, Keyboard, Nfc, QrCode, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ScanMethod = "QR" | "NFC" | "FACE" | "FINGERPRINT" | "MANUAL";

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
  { id: "FACE", label: "Face", icon: ScanFace, hint: "Use a face-recognition terminal that outputs the matched student's code below." },
  { id: "FINGERPRINT", label: "Fingerprint", icon: Fingerprint, hint: "Use a fingerprint terminal that outputs the matched student's code below." },
  { id: "MANUAL", label: "Manual", icon: Keyboard, hint: "Type or paste a student code, QR value, or tag manually." },
];

const hasBarcodeDetector = () => typeof window !== "undefined" && "BarcodeDetector" in window;
const hasNfc = () => typeof window !== "undefined" && "NDEFReader" in window;

export function ScanBoardDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string, method: ScanMethod) => Promise<void>;
}) {
  const [method, setMethod] = useState<ScanMethod>("QR");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nfcAbort = useRef<AbortController | null>(null);

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
        await onSubmit(trimmed, via);
        setCode("");
        setStatus(null);
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, onSubmit],
  );

  const startCamera = useCallback(async () => {
    if (!hasBarcodeDetector()) {
      setStatus("This device/browser has no camera QR scanner. Use a handheld scanner or type the code.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      setStatus("Point the camera at the student's QR code.");
    } catch {
      setStatus("Could not open the camera. Check permissions or type the code instead.");
    }
  }, []);

  useEffect(() => {
    if (!cameraOn) return;
    const ctor = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector;
    const detector = new ctor({ formats: ["qr_code"] });
    let active = true;
    const timer = setInterval(async () => {
      if (!active || !videoRef.current) return;
      try {
        const results = await detector.detect(videoRef.current);
        if (results.length && results[0].rawValue) {
          active = false;
          stopCamera();
          void submit(results[0].rawValue, "QR");
        }
      } catch {
        /* transient decode error, keep scanning */
      }
    }, 400);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [cameraOn, stopCamera, submit]);

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
      return;
    }
    inputRef.current?.focus();
  }, [open, stopCamera]);

  useEffect(() => {
    stopCamera();
    nfcAbort.current?.abort();
    nfcAbort.current = null;
    if (method === "QR" && hasBarcodeDetector()) void startCamera();
    if (method === "NFC" && hasNfc()) void startNfc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

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

      {method === "QR" ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-black/80">
          {cameraOn ? (
            <video ref={videoRef} className="h-56 w-full object-cover" muted playsInline />
          ) : (
            <div className="flex h-56 flex-col items-center justify-center gap-3 text-sm text-white/70">
              <CameraOff size={26} />
              Camera off
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {method === "QR" ? (
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
