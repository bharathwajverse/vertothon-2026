import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, Zap, ZapOff } from 'lucide-react';
import { Button } from '../common';

interface QrCameraScannerProps {
  onScan: (token: string) => void;
  isScanningActive?: boolean;
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({
  onScan,
  isScanningActive = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setTorchEnabled(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setErrorMessage(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setHasPermission(false);
      setErrorMessage('Camera API is not supported on this device/browser.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = typeof videoTrack.getCapabilities === 'function' ? (videoTrack.getCapabilities() as Record<string, unknown>) : {};
        if (capabilities && 'torch' in capabilities) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setHasPermission(false);
      const errName = (err as Error)?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied. Please allow camera permissions in browser settings.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setErrorMessage('No camera device found on this system.');
      } else {
        setErrorMessage((err as Error)?.message || 'Failed to initialize video camera.');
      }
    }
  }, [facingMode, stopStream]);

  // Handle Torch toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchEnabled;
        // Advanced constraint for torch
        await (track as MediaStreamTrack & { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchEnabled(nextState);
      } catch (err) {
        console.warn('Failed to toggle torch:', err);
      }
    }
  };

  // Flip between front/rear camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Continuous frame analysis via BarcodeDetector API if supported
  useEffect(() => {
    if (!isScanningActive || hasPermission !== true) return;

    let isScanning = true;
    const barcodeDetector =
      typeof window !== 'undefined' && 'BarcodeDetector' in window
        ? new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector({
            formats: ['qr_code', 'code_128', 'code_39', 'data_matrix'],
          })
        : null;

    const scanFrame = async () => {
      if (!isScanning) return;

      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        if (barcodeDetector) {
          try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes && barcodes.length > 0) {
              const detected = barcodes[0].rawValue;
              if (detected && detected !== lastScanned) {
                setLastScanned(detected);
                onScan(detected);
              }
            }
          } catch {
            // Ignore frame detection errors
          }
        }
      }

      if (isScanning) {
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    };

    animFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [hasPermission, isScanningActive, lastScanned, onScan]);

  // Lifecycle
  useEffect(() => {
    if (isScanningActive) {
      startCamera();
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isScanningActive, startCamera, stopStream]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 text-white flex flex-col items-center justify-center min-h-[260px]">
      {/* Video preview */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        data-testid="camera-video-preview"
        className={`w-full max-h-[300px] object-cover transition-opacity duration-300 ${
          hasPermission ? 'opacity-100' : 'opacity-0 absolute'
        }`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Target Reticle Overlay */}
      {hasPermission && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-52 h-52 border-2 border-indigo-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]">
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-indigo-500"></div>
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-indigo-500"></div>
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-indigo-500"></div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-indigo-500"></div>
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-rose-500/60 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Camera Controls Bar */}
      {hasPermission && (
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-xs p-1.5 rounded-lg border border-slate-700/60 z-10">
          {torchSupported && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-1.5 rounded-md transition-colors ${
                torchEnabled ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={torchEnabled ? 'Disable Torch' : 'Enable Torch'}
              aria-label="Toggle Torch"
            >
              {torchEnabled ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={toggleFacingMode}
            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={`Switch to ${facingMode === 'environment' ? 'Front' : 'Rear'} Camera`}
            aria-label="Switch Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Permission Denied or Not Supported State */}
      {hasPermission === false && (
        <div className="p-6 text-center space-y-3 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto">
            <CameraOff className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-200">Camera Unavailable</h4>
            <p className="text-xs text-slate-400">{errorMessage || 'Camera access is required for scanning.'}</p>
          </div>
          <Button variant="outline" size="sm" onClick={startCamera} className="text-white border-slate-700">
            <Camera className="w-3.5 h-3.5 mr-1.5" /> Retry Camera Access
          </Button>
        </div>
      )}

      {/* Requesting permission placeholder */}
      {hasPermission === null && (
        <div className="p-6 text-center space-y-2">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-slate-400">Requesting camera permissions...</p>
        </div>
      )}

      {/* Sub-bar hint */}
      {hasPermission && (
        <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
          <span className="text-[11px] font-mono text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-md">
            Align badge QR inside viewfinder
          </span>
        </div>
      )}
    </div>
  );
};
