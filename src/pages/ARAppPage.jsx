import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeScreen } from '../components/ar/WelcomeScreen';
import { ScanOverlay } from '../components/ar/ScanOverlay';
import { HandOverlay } from '../components/ar/HandOverlay';
import { PartDetailCard } from '../components/ar/PartDetailCard';
import { TeardownControls } from '../components/ar/TeardownControls';
import { ModelSelectModal } from '../components/ar/ModelSelectModal';
import { PhoneViewer } from '../three/PhoneViewer';
import phonesData from '../data/phones.json';
import partsData from '../data/parts.json';
import { getResolvedParts } from '../data/componentResolver';
import { detectPhoneInVideo } from '../ml/detector';
import { recognizePhoneFromImage } from '../ml/ocr';
import { getHandLandmarker, HandGestureEngine } from '../ml/handGestures';
import { stopNarration } from '../ml/audioNarration';
import { Scan, SwitchCamera, Lock, Unlock } from 'lucide-react';
import gsap from 'gsap';
export const ARAppPage = () => {
    const navigate = useNavigate();
    const phones = phonesData;
    // Core App State
    const [phase, setPhase] = useState('welcome');
    const [activePhone, setActivePhone] = useState(phones[0]);
    const resolvedParts = React.useMemo(() => getResolvedParts(activePhone), [activePhone]);
    const parts = resolvedParts;
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [facingMode, setFacingMode] = useState('environment');
    // Teardown state
    const [explodeFactor, setExplodeFactor] = useState(0.15);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedPartId, setSelectedPartId] = useState(null);
    // 3D Model Rotation Lock (Locks model still for precision part picking)
    const [isRotationLocked, setIsRotationLocked] = useState(false);
    const isRotationLockedRef = useRef(false);
    useEffect(() => {
        isRotationLockedRef.current = isRotationLocked;
    }, [isRotationLocked]);
    // ML & Vision Detection State
    const [detectedPhone, setDetectedPhone] = useState(null);
    const [detectedBrand, setDetectedBrand] = useState(null);
    const [confidence, setConfidence] = useState(0);
    const [detectedBBox, setDetectedBBox] = useState(null);
    const [videoSize, setVideoSize] = useState({ width: 1280, height: 720 });
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    // Hand Tracking Visibility
    const [showHandOverlay, setShowHandOverlay] = useState(true);
    // Quality Setting
    const [quality, setQuality] = useState('high');
    // Imperative & Performance Refs (Zero React re-renders during 60 FPS tracking)
    const phoneViewerRef = useRef(null);
    const handOverlayRef = useRef(null);
    const lastActionRef = useRef('neutral');
    const lastSelectedPartRef = useRef(null);
    const explodeFactorObjRef = useRef({ val: 0.15 });
    // DOM Refs
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const animFrameRef = useRef(null);
    const handEngineRef = useRef(new HandGestureEngine());
    const isOCRRunningRef = useRef(false);
    const lastDetectionTimeRef = useRef(0);
    const lastHandTrackTimeRef = useRef(0);
    const containerRef = useRef(null);
    // Ordered teardown components
    const sortedParts = [...parts].sort((a, b) => a.layer - b.layer);
    const totalSteps = sortedParts.length;
    // 1. Initialize Camera
    const startCamera = async (mode = facingMode) => {
        setCameraError(null);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
        }
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API is not supported in this browser.');
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: mode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraActive(true);
            setFacingMode(mode);
            setPhase('scanning');
        }
        catch (err) {
            console.warn('Camera initiation failed:', err);
            const msg = err instanceof Error ? err.message : 'Camera access was denied or unavailable.';
            setCameraError(msg);
            // Fallback: Proceed directly to teardown mode
            setPhase('teardown');
        }
    };
    const toggleFacingMode = () => {
        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
        startCamera(nextMode);
    };
    // 2. Stop Camera
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    }, []);
    useEffect(() => {
        return () => {
            stopCamera();
            stopNarration();
            if (animFrameRef.current)
                cancelAnimationFrame(animFrameRef.current);
        };
    }, [stopCamera]);
    // 3. Vision Loop - Optimized for lag-free 60 FPS performance
    useEffect(() => {
        let isCancelled = false;
        const visionLoop = async (timestamp) => {
            if (isCancelled)
                return;
            const video = videoRef.current;
            if (video && video.readyState >= 2) {
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    setVideoSize({ width: video.videoWidth, height: video.videoHeight });
                }
                // A. Scanning Phase: Object Detection (Throttled to 4 FPS / 250ms)
                if (phase === 'scanning') {
                    if (timestamp - lastDetectionTimeRef.current > 250) {
                        lastDetectionTimeRef.current = timestamp;
                        try {
                            const detectRes = await detectPhoneInVideo(video);
                            if (detectRes.detected) {
                                setDetectedBBox(detectRes.bbox);
                                if (detectRes.croppedCanvas && !isOCRRunningRef.current) {
                                    isOCRRunningRef.current = true;
                                    recognizePhoneFromImage(detectRes.croppedCanvas)
                                        .then((ocrRes) => {
                                            if (ocrRes.matchedPhone && ocrRes.confidence >= 70) {
                                                setDetectedPhone(ocrRes.matchedPhone);
                                                setConfidence(ocrRes.confidence);
                                            } else if (ocrRes.detectedBrand) {
                                                setDetectedBrand(ocrRes.detectedBrand);
                                                setConfidence(Math.max(65, ocrRes.confidence));
                                                setDetectedPhone(null);
                                            } else {
                                                setDetectedPhone(null);
                                            }
                                        })
                                        .finally(() => {
                                            isOCRRunningRef.current = false;
                                        });
                                }
                            } else {
                                setDetectedBBox(null);
                            }
                        } catch {
                            // Safe fallback
                        }
                    }
                }
                // B. Teardown Phase: Hand Tracking (Throttled to ~30 FPS / 33ms)
                if (phase === 'teardown') {
                    if (timestamp - lastHandTrackTimeRef.current > 33) {
                        lastHandTrackTimeRef.current = timestamp;
                        try {
                            const landmarker = await getHandLandmarker();
                            const results = landmarker.detectForVideo(video, timestamp);
                            if (results && results.landmarks && results.landmarks.length > 0) {
                                const hands = results.landmarks;
                                const processed = handEngineRef.current.processHands(hands, timestamp);

                                // Real-time hover detection over 3D components
                                let hoveredHitId = null;
                                if (processed.cursorPoint) {
                                    hoveredHitId = phoneViewerRef.current?.hoverAtPoint(processed.cursorPoint.x, processed.cursorPoint.y);
                                }

                                const hoveredPartObj = hoveredHitId ? parts.find(p => p.id === hoveredHitId) : null;
                                const hoveredName = hoveredPartObj ? (hoveredPartObj.name.split(' ')[0] || hoveredPartObj.name) : '';

                                // 1. Direct Canvas Draw (0 React re-renders)
                                if (showHandOverlay) {
                                    handOverlayRef.current?.draw({
                                        landmarks: hands,
                                        isTwoFingerJoin: processed.isTwoFingerJoin,
                                        isPointing: processed.isPointing,
                                        cursorPoint: processed.cursorPoint,
                                        isRotationLocked: isRotationLockedRef.current,
                                        hoveredPartName: hoveredName,
                                        actionName: processed.handAction,
                                    });
                                }

                                // 2. Direct 3D Rotation via Hand Movement (0 React re-renders)
                                // ROTATION IS BLOCKED when:
                                // - User enabled Rotation Lock toggle, OR
                                // - User is currently pointing at a part, OR
                                // - User is currently pinching (inspecting)
                                if (!isRotationLockedRef.current && !processed.isTwoFingerJoin && !processed.isPointing) {
                                    if (processed.deltaHandRotation.x !== 0 || processed.deltaHandRotation.y !== 0) {
                                        phoneViewerRef.current?.applyRotationDelta(processed.deltaHandRotation.x, processed.deltaHandRotation.y);
                                    }
                                }

                                // 3. Two-Finger Join (Pinch) -> Raycast mesh & show details card
                                if (processed.isTwoFingerJoin && processed.cursorPoint) {
                                    const hitId = phoneViewerRef.current?.raycastAtPoint(processed.cursorPoint.x, processed.cursorPoint.y);
                                    if (hitId && hitId !== lastSelectedPartRef.current) {
                                        lastSelectedPartRef.current = hitId;
                                        setSelectedPartId(hitId);
                                    }
                                }
                                // 4. Palm Closed (Assemble)
                                if (processed.handAction === 'assemble' && lastActionRef.current !== 'assemble') {
                                    lastActionRef.current = 'assemble';
                                    gsap.killTweensOf(explodeFactorObjRef.current);
                                    gsap.to(explodeFactorObjRef.current, {
                                        val: 0.0,
                                        duration: 0.45,
                                        ease: 'power2.out',
                                        onUpdate: () => {
                                            setExplodeFactor(explodeFactorObjRef.current.val);
                                        },
                                    });
                                }
                                // 5. Palm Opened (Disassemble)
                                else if (processed.handAction === 'disassemble' && lastActionRef.current !== 'disassemble') {
                                    lastActionRef.current = 'disassemble';
                                    gsap.killTweensOf(explodeFactorObjRef.current);
                                    gsap.to(explodeFactorObjRef.current, {
                                        val: 0.85,
                                        duration: 0.5,
                                        ease: 'power2.out',
                                        onUpdate: () => {
                                            setExplodeFactor(explodeFactorObjRef.current.val);
                                        },
                                    });
                                }
                                else if (processed.handAction === 'neutral' && !processed.isTwoFingerJoin) {
                                    lastActionRef.current = 'neutral';
                                }
                            }
                            else {
                                handOverlayRef.current?.clear();
                            }
                        }
                        catch {
                            // Frame skipped safely
                        }
                    }
                }
            }
            animFrameRef.current = requestAnimationFrame(visionLoop);
        };
        animFrameRef.current = requestAnimationFrame(visionLoop);
        return () => {
            isCancelled = true;
            if (animFrameRef.current)
                cancelAnimationFrame(animFrameRef.current);
        };
    }, [phase, showHandOverlay, phones]);
    // Synchronize step changes to explode factor
    const handleStepChange = (newStep) => {
        setCurrentStep(newStep);
        const fraction = newStep / Math.max(1, totalSteps - 1);
        const targetVal = 0.15 + fraction * 0.8;
        explodeFactorObjRef.current.val = targetVal;
        setExplodeFactor(targetVal);
        const partId = sortedParts[newStep]?.id || null;
        setSelectedPartId(partId);
        lastSelectedPartRef.current = partId;
    };
    const handleExplodeChange = (f) => {
        explodeFactorObjRef.current.val = f;
        setExplodeFactor(f);
    };
    // Quick simulate match demo for immediate testing
    const handleQuickSimulateMatch = (phoneId, autoLaunch = false) => {
        const target = phones.find((p) => p.id === phoneId) || phones[0];
        setActivePhone(target);
        setDetectedPhone(target);
        setConfidence(97);
        if (autoLaunch) {
            setPhase('teardown');
        }
    };
    // Screenshot Capture
    const handleScreenshot = () => {
        const video = videoRef.current;
        const canvas = containerRef.current?.querySelector('canvas');
        if (!canvas)
            return;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const ctx = exportCanvas.getContext('2d');
        if (!ctx)
            return;
        if (video && video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);
        }
        else {
            const grad = ctx.createLinearGradient(0, 0, 0, exportCanvas.height);
            grad.addColorStop(0, '#04060f');
            grad.addColorStop(1, '#0b1025');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }
        ctx.drawImage(canvas, 0, 0);
        ctx.fillStyle = '#00f0ff';
        ctx.font = '700 20px "Space Grotesk", sans-serif';
        ctx.fillText(`AR TEARDOWN PRO • ${activePhone.brand} ${activePhone.model}`, 30, exportCanvas.height - 30);
        const dataUrl = exportCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `ar-teardown-${activePhone.id}-${Date.now()}.png`;
        a.click();
    };
    const selectedPart = parts.find((p) => p.id === selectedPartId);
    return (<div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-navy-950 select-none">
      {/* 1. Underlying Camera Video Stream */}
      <video ref={videoRef} playsInline muted autoPlay className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}/>

      {/* Dark tint overlay for AR contrast */}
      <div className={`absolute inset-0 z-1 pointer-events-none transition-colors duration-500 ${cameraActive ? 'bg-navy-950/25' : 'bg-navy-950'}`}/>

      {/* 2. Procedural 3D Phone Model - ONLY ACTIVE DURING TEARDOWN PHASE */}
      {phase === 'teardown' && (
        <div className="absolute inset-0 z-10">
          <PhoneViewer
            ref={phoneViewerRef}
            config={activePhone}
            explodeFactor={explodeFactor}
            selectedPartId={selectedPartId}
            onSelectPart={(id) => {
              setSelectedPartId(id);
              lastSelectedPartRef.current = id;
            }}
            interactive={true}
            autoRotate={false}
            quality={quality}
            transparentBg={cameraActive}
            height="100%"
            isRotationLocked={isRotationLocked}
          />
        </div>
      )}

      {/* 3. MediaPipe Hand Landmark Overlay (during teardown) */}
      {showHandOverlay && phase === 'teardown' && (
        <HandOverlay
          ref={handOverlayRef}
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}

      {/* 4. Scanning & Detection Reticle HUD (Clean camera view without phone blocking) */}
      {phase === 'scanning' && (
        <ScanOverlay
          isScanning={true}
          detectedPhone={detectedPhone}
          detectedBrand={detectedBrand}
          confidence={confidence}
          detectedBBox={detectedBBox}
          videoSize={videoSize}
          onConfirm={(chosen) => {
            const target = chosen || (detectedPhone && confidence >= 70 ? detectedPhone : null);
            if (target) {
              setActivePhone(target);
              setPhase('teardown');
            } else {
              setIsModelModalOpen(true);
            }
          }}
          onWrong={() => {
            setDetectedPhone(null);
            setDetectedBrand(null);
            setConfidence(0);
            setIsModelModalOpen(true);
          }}
          onOpenManualPicker={() => setIsModelModalOpen(true)}
          onFlipCamera={toggleFacingMode}
          onSkipToTeardown={() => {
            const target = (detectedPhone && confidence >= 70) ? detectedPhone : (activePhone || phones[0]);
            setActivePhone(target);
            setPhase('teardown');
          }}
          onQuickSimulateMatch={handleQuickSimulateMatch}
        />
      )}

      {/* Top Floating Bar during Teardown Phase */}
      {phase === 'teardown' && (
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
          {/* Active Model Indicator */}
          <button
            onClick={() => setIsModelModalOpen(true)}
            className="glass-card px-3.5 py-1.5 rounded-full border border-cyan-400/40 text-xs text-white hover:border-cyan-400 transition-colors flex items-center gap-2 shadow-cyan-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold font-heading">
              {activePhone.displayName ||
                (activePhone.model
                  .toLowerCase()
                  .startsWith(activePhone.brand.toLowerCase())
                  ? activePhone.model
                  : `${activePhone.brand} ${activePhone.model}`)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {activePhone.year}
            </span>
          </button>

          {/* 3D Rotation Lock / Free Rotate Mode Button */}
          <button
            onClick={() => setIsRotationLocked((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md ${
              isRotationLocked
                ? 'bg-amber-400 text-navy-950 border-amber-300 font-bold shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                : 'bg-navy-950/80 text-cyan-300 border-cyan-400/40 hover:border-cyan-400'
            }`}
            title={
              isRotationLocked
                ? '3D Rotation Locked (Click to Free Rotate)'
                : 'Click to Lock 3D Rotation for Easy Selection'
            }
          >
            {isRotationLocked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
            <span>{isRotationLocked ? '3D Locked' : 'Free Rotate'}</span>
          </button>

          {/* Rescan & Flip buttons */}
          <div className="flex items-center gap-2">
            {cameraActive && (
              <button
                onClick={toggleFacingMode}
                className="glass-card p-2 rounded-xl border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors"
                title="Flip Camera (Front/Back)"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setPhase('scanning')}
              className="glass-card px-3 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors text-xs flex items-center gap-1.5"
              title="Return to Scan Mode"
            >
              <Scan className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scan Phone</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Teardown Interactive Controls HUD */}
      {phase === 'teardown' && (
        <TeardownControls
          phone={activePhone}
          currentStep={currentStep}
          totalSteps={totalSteps}
          explodeFactor={explodeFactor}
          onStepChange={handleStepChange}
          onExplodeChange={handleExplodeChange}
          onReset={() => {
            explodeFactorObjRef.current.val = 0.15;
            setExplodeFactor(0.15);
            setSelectedPartId(null);
            lastSelectedPartRef.current = null;
            setCurrentStep(0);
            phoneViewerRef.current?.resetView();
          }}
          onScreenshot={handleScreenshot}
          quality={quality}
          onToggleQuality={() =>
            setQuality((q) => (q === 'high' ? 'low' : 'high'))
          }
          showHands={showHandOverlay}
          onToggleHands={() => setShowHandOverlay((s) => !s)}
          onSelectModelClick={() => setIsModelModalOpen(true)}
          onZoomIn={() => phoneViewerRef.current?.zoomIn()}
          onZoomOut={() => phoneViewerRef.current?.zoomOut()}
          onResetZoom={() => phoneViewerRef.current?.resetZoom()}
          isRotationLocked={isRotationLocked}
          onToggleRotationLock={() => setIsRotationLocked((prev) => !prev)}
          selectedPartId={selectedPartId}
          onSelectPart={(id) => {
            setSelectedPartId(id);
            lastSelectedPartRef.current = id;
          }}
        />
      )}

      {/* 6. Selected Component Specs Glass Card */}
      {selectedPart && phase === 'teardown' && (<PartDetailCard part={selectedPart} phone={activePhone} onClose={() => {
                setSelectedPartId(null);
                lastSelectedPartRef.current = null;
            }}/>)}

      {/* 7. Welcome Modal */}
      {phase === 'welcome' && (<WelcomeScreen onStartCamera={() => startCamera('environment')} onChooseManual={() => {
                setPhase('teardown');
                setIsModelModalOpen(true);
            }} onBack={() => navigate('/')} cameraError={cameraError}/>)}

      {/* 8. Smartphone Model Picker Modal (1,081 Models 2022-2026) */}
      <ModelSelectModal isOpen={isModelModalOpen} onClose={() => setIsModelModalOpen(false)} onSelectModel={(phone) => {
            setActivePhone(phone);
            setPhase('teardown');
        }} currentPhoneId={activePhone.id}/>
    </div>);
};
