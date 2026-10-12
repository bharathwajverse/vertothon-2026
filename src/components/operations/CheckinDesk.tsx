import React, { useState } from 'react';
import { Camera, QrCode } from 'lucide-react';
import { Card, Button, Badge } from '../common';
import { verifyAndCheckInAttendee, CheckinResult } from '../../services/operationsService';
import { QrCameraScanner } from './QrCameraScanner';

export const CheckinDesk: React.FC = () => {
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<Array<{ name: string; time: string; email: string }>>([]);

  const executeCheckin = async (rawToken: string) => {
    const cleanToken = rawToken.trim();
    if (!cleanToken) return;

    setIsProcessing(true);
    setResult(null);

    const res = await verifyAndCheckInAttendee(cleanToken);
    setIsProcessing(false);
    setResult(res);

    if (res.success && res.profile && !res.alreadyCheckedIn) {
      setRecentCheckins((prev) => [
        {
          name: res.profile!.fullName,
          email: res.profile!.email,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 9),
      ]);
      setInputVal('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCheckin(inputVal);
  };

  const handleCameraScan = (scannedCode: string) => {
    if (isProcessing) return;
    setInputVal(scannedCode);
    executeCheckin(scannedCode);
  };

  return (
    <div className="space-y-6">
      <Card className="border-indigo-100 dark:border-indigo-900/40">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                Attendee QR & Badge Check-in Desk
              </h2>
              <p className="text-xs text-slate-500">
                Scan barcode/QR token using camera or manual token entry to verify approval and record badge issuance.
              </p>
            </div>

            <Button
              type="button"
              variant={isCameraActive ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setIsCameraActive((prev) => !prev)}
              data-testid="toggle-camera-btn"
            >
              <Camera className="w-4 h-4 mr-1.5" />
              {isCameraActive ? 'Close Camera' : 'Open Camera Scanner'}
            </Button>
          </div>

          {/* Camera Scanner Container */}
          {isCameraActive && (
            <div className="pt-2">
              <QrCameraScanner
                onScan={handleCameraScan}
                isScanningActive={isCameraActive && !isProcessing}
              />
            </div>
          )}

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2">
            <label htmlFor="token-manual-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Manual Token / Attendee Identifier Fallback
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="token-manual-input"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Scan or paste 16-hex token / User UUID..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isProcessing || !inputVal.trim()}
              >
                {isProcessing ? 'Verifying...' : 'Check In Attendee'}
              </Button>
            </div>
          </form>
        </div>

        {result && (
          <div
            role="status"
            className={`mt-4 p-4 rounded-xl border text-sm ${
              result.success && !result.alreadyCheckedIn
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : result.alreadyCheckedIn
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">
                {result.success && !result.alreadyCheckedIn
                  ? '✓ Check-in Verified'
                  : result.alreadyCheckedIn
                  ? '⚠️ Already Checked In'
                  : '✕ Verification Failed'}
              </span>
              {result.profile && (
                <Badge variant={result.profile.registrationStatus === 'approved' ? 'success' : 'warning'}>
                  {result.profile.registrationStatus}
                </Badge>
              )}
            </div>
            {result.profile && (
              <p className="mt-1 text-xs">
                Participant: <span className="font-semibold">{result.profile.fullName}</span> ({result.profile.email})
                {result.profile.collegeOrCompany && ` • ${result.profile.collegeOrCompany}`}
              </p>
            )}
            {result.error && <p className="mt-1 text-xs font-medium">{result.error}</p>}
          </div>
        )}
      </Card>

      {/* Real-time Session Log */}
      <Card>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Session Check-in Activity ({recentCheckins.length})
        </h3>
        {recentCheckins.length === 0 ? (
          <p className="text-xs text-slate-400">No participants checked in during this session yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {recentCheckins.map((chk, idx) => (
              <li key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{chk.name}</span>
                  <span className="text-slate-400 ml-2">({chk.email})</span>
                </div>
                <span className="text-slate-400 font-mono">{chk.time}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
