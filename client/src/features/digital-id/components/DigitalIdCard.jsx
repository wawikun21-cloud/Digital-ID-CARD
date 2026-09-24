import { useRef, useState } from 'react';
import DigitalIdFront from './DigitalIdFront';
import DigitalIdBack from './DigitalIdBack';
import DigitalIdControls from './DigitalIdControls';
import { useCardTilt } from '../hooks/useCardTilt';
import { useCardFlip } from '../hooks/useCardFlip';
import { downloadQrCodePng } from '../utils/qrDownload';

/**
 * The interactive 3D card. Tilt and flip live on separate nested
 * transform layers (see digital-id.css) so neither animation ever
 * overwrites the other:
 *
 *   .id-stage        -> establishes perspective
 *     .id-tilt-layer -> small pointer-driven rotateX/rotateY
 *       .id-flipper  -> the 180deg flip, preserve-3d
 *         .id-face   -> front / back, each backface-hidden
 *
 * The card face is a plain <div> rather than a <button>: the back now
 * holds real social-link anchors, and a button element cannot contain
 * other interactive controls. Tapping/clicking the card is still a
 * convenience shortcut for flipping (guarded so it ignores clicks on a
 * link), while the "Show back/front" control below is the primary,
 * fully keyboard-accessible way to flip. Each face is aria-hidden and
 * un-tabbable while it's the one rotated out of view, so assistive
 * tech and Tab order only ever see the side currently on screen.
 *
 * "Download QR" lives outside the card, above it, rather than on the
 * back face — both faces are always mounted (just rotated away via
 * CSS), so the QR's <svg> node exists whichever side is showing, and
 * the download no longer needs the card flipped first.
 */
export default function DigitalIdCard({ digitalId }) {
  const { stageRef, tilt, onPointerMove, onPointerLeave, onTouchMove, onTouchEnd } =
    useCardTilt();
  const { flipped, toggleFlip } = useCardFlip();
  const [isLive, setIsLive] = useState(false);
  const qrRef = useRef(null);
  const [downloadError, setDownloadError] = useState(null);

  const handleCardClick = (event) => {
    if (event.target.closest('a')) return; // let the social link navigate instead of flipping
    toggleFlip();
  };

  async function handleDownloadQr() {
    setDownloadError(null);
    try {
      const safeId = (digitalId.id || 'digital-id').replace(/[^a-z0-9-]+/gi, '-');
      await downloadQrCodePng(qrRef.current, `${safeId}-qr.png`);
    } catch (error) {
      setDownloadError(error.message);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={stageRef}
        className="id-stage w-full max-w-[300px]"
        style={{ aspectRatio: '1 / 1.586' }}
      >
        <div
          onClick={handleCardClick}
          onPointerMove={(e) => {
            setIsLive(true);
            onPointerMove(e);
          }}
          onPointerLeave={onPointerLeave}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`id-tilt-layer ${isLive ? 'id-tilt-layer--live' : ''} h-full w-full cursor-pointer rounded-2xl`}
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          <div
            className="id-flipper h-full w-full rounded-2xl shadow-[0_25px_60px_-15px_rgba(42,10,18,0.45)]"
            style={{ transform: `rotateY(${flipped ? 180 : 0}deg)` }}
          >
            <div className="id-face rounded-2xl border border-line" aria-hidden={flipped}>
              <DigitalIdFront digitalId={digitalId} interactive={!flipped} />
            </div>
            <div className="id-face id-face--back rounded-2xl border border-ink/40" aria-hidden={!flipped}>
              <DigitalIdBack digitalId={digitalId} interactive={flipped} qrRef={qrRef} />
            </div>
          </div>
        </div>
      </div>

      <DigitalIdControls onDownloadQr={handleDownloadQr} downloadError={downloadError} />
    </div>
  );
}
