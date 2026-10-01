import React, { useRef, useState, useCallback } from 'react';
import { Camera, ImagePlus, X, RotateCcw, Check, Loader2, AlertTriangle } from 'lucide-react';

interface PhotoUploadProps {
  /** Current avatar URL (if any) */
  currentUrl?: string | null;
  /** Initials fallback when no photo */
  initials?: string;
  /** Called with the final File ready to upload */
  onSave: (file: File) => Promise<void>;
  /** Optional extra class on the outer wrapper */
  className?: string;
}

// ── Helpers ──────────────────────────────────────────────────
function dataURLtoFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

// ── Component ─────────────────────────────────────────────────
export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentUrl,
  initials = 'M',
  onSave,
  className = '',
}) => {
  // ── State ──
  const [mode,       setMode]       = useState<'idle' | 'menu' | 'camera' | 'preview'>('idle');
  const [preview,    setPreview]    = useState<string | null>(null);
  const [previewFile,setPreviewFile]= useState<File | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [camError,   setCamError]   = useState('');
  const [streaming,  setStreaming]   = useState(false);

  // ── Refs ──
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);

  // ── Close / reset ──
  const reset = useCallback(() => {
    stopStream();
    setMode('idle');
    setPreview(null);
    setPreviewFile(null);
    setError('');
    setCamError('');
    setStreaming(false);
    if (fileInputRef.current)   fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  // ── Stop webcam stream ──
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  };

  // ── Choose from device (gallery / file picker) ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPreviewFile(file);
    setMode('preview');
  };

  // ── Open device camera (mobile capture) ──
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e);
  };

  // ── Start webcam (desktop browsers) ──
  const startWebcam = async () => {
    setCamError('');
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch (err: any) {
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera access was denied. Please allow camera access in your browser settings.'
        : err?.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : 'Could not open camera. Please use "Choose from Device" instead.';
      setCamError(msg);
      setStreaming(false);
    }
  };

  // ── Capture snapshot from webcam ──
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 640;
    canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const file    = dataURLtoFile(dataUrl, `photo-${Date.now()}.jpg`);
    stopStream();
    setPreview(dataUrl);
    setPreviewFile(file);
    setMode('preview');
  };

  // ── Save the previewed photo ──
  const handleSave = async () => {
    if (!previewFile) return;
    setSaving(true);
    setError('');
    try {
      await onSave(previewFile);
      reset();
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Determine if native camera input works (mobile) ──
  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>

      {/* ── Avatar display ── */}
      <div className="relative group">
        <div className="w-28 h-28 rounded-2xl overflow-hidden ring-2 ring-tcm-gold/50 shadow-gold bg-tcm-gold/20 flex items-center justify-center">
          {preview
            ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            : currentUrl
            ? <img src={currentUrl} alt="Profile" className="w-full h-full object-cover" />
            : <span className="text-4xl font-black text-tcm-gold">{initials}</span>
          }
        </div>

        {/* Camera button overlay */}
        {mode === 'idle' && (
          <button
            type="button"
            onClick={() => setMode('menu')}
            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-tcm-gold flex items-center justify-center hover:bg-tcm-gold-lt transition-colors shadow-gold"
            aria-label="Change profile photo"
            title="Change photo"
          >
            <Camera className="w-4 h-4 text-tcm-navy" />
          </button>
        )}
      </div>

      {/* ── Mode: MENU ── */}
      {mode === 'menu' && (
        <div className="w-full max-w-xs bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-black text-tcm-navy text-sm">Change Profile Photo</p>
            <button type="button" onClick={reset} className="text-tcm-gray-mid hover:text-tcm-navy transition-colors" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 flex flex-col gap-2">

            {/* Take photo — mobile uses native camera, desktop uses webcam */}
            {isMobile ? (
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-tcm-gray-soft transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-tcm-gold/10 border border-tcm-gold/20 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-4 h-4 text-tcm-gold" />
                </div>
                <div>
                  <p className="font-bold text-tcm-navy text-sm">Take a Photo</p>
                  <p className="text-tcm-gray-mid text-xs">Open your camera</p>
                </div>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleCameraCapture}
                  className="sr-only"
                />
              </label>
            ) : (
              <button
                type="button"
                onClick={startWebcam}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-tcm-gray-soft transition-colors text-left w-full"
              >
                <div className="w-9 h-9 rounded-xl bg-tcm-gold/10 border border-tcm-gold/20 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-4 h-4 text-tcm-gold" />
                </div>
                <div>
                  <p className="font-bold text-tcm-navy text-sm">Take a Photo</p>
                  <p className="text-tcm-gray-mid text-xs">Use your webcam</p>
                </div>
              </button>
            )}

            {/* Choose from device */}
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-tcm-gray-soft transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-tcm-navy/8 border border-tcm-navy/15 flex items-center justify-center flex-shrink-0">
                <ImagePlus className="w-4 h-4 text-tcm-navy" />
              </div>
              <div>
                <p className="font-bold text-tcm-navy text-sm">Choose from Device</p>
                <p className="text-tcm-gray-mid text-xs">JPG, PNG or WebP · max 5 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

          </div>
          {error && (
            <div className="mx-3 mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-xs font-medium">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Mode: CAMERA (webcam) ── */}
      {mode === 'camera' && (
        <div className="w-full max-w-xs bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-black text-tcm-navy text-sm">Take a Photo</p>
            <button type="button" onClick={reset} className="text-tcm-gray-mid hover:text-tcm-navy transition-colors" aria-label="Close camera">
              <X className="w-4 h-4" />
            </button>
          </div>

          {camError ? (
            <div className="p-4">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 text-xs leading-relaxed">{camError}</p>
              </div>
              {/* Fallback to file picker */}
              <label className="btn-outline-navy w-full justify-center py-2.5 text-sm inline-flex items-center gap-2 cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                Choose from Device Instead
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-3">
              {/* Video preview */}
              <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!streaming && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                {/* Viewfinder guide */}
                {streaming && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-40 rounded-full border-2 border-white/40" />
                  </div>
                )}
              </div>
              {/* Hidden canvas for snapshot */}
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-gray-200 text-tcm-gray-dark text-sm font-bold hover:border-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={captureSnapshot}
                  disabled={!streaming}
                  className="flex-1 btn-primary py-2.5 justify-center"
                >
                  <Camera className="w-4 h-4" /> Capture
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Mode: PREVIEW ── */}
      {mode === 'preview' && preview && (
        <div className="w-full max-w-xs bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-black text-tcm-navy text-sm">Looks Good?</p>
            <button type="button" onClick={reset} disabled={saving} className="text-tcm-gray-mid hover:text-tcm-navy transition-colors" aria-label="Cancel">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 flex flex-col gap-3">
            {/* Preview image */}
            <div className="rounded-xl overflow-hidden aspect-square bg-tcm-gray-soft">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              {/* Retake / re-choose */}
              <button
                type="button"
                onClick={() => setMode('menu')}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full border-2 border-gray-200 text-tcm-gray-dark text-sm font-bold hover:border-gray-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retake
              </button>
              {/* Save */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary py-2.5 justify-center"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Check className="w-4 h-4" /> Save Photo</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Idle hint */}
      {mode === 'idle' && (
        <p className="text-white/35 text-[10px]">Tap 📷 to change photo</p>
      )}
    </div>
  );
};
