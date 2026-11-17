import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { HAND_CONNECTIONS } from '../../ml/handGestures';
const HandOverlayComponent = ({ landmarks = [], width, height, isTwoFingerJoin = false, pinchPoint = null, handAction = 'neutral', }, ref) => {
    const canvasRef = useRef(null);
    const badgeDivRef = useRef(null);
    const badgeTextRef = useRef(null);
    const renderToCanvas = (hands, isPinch, pinchPt, isPoint = false, cursorPt = null) => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const w = canvas.width || width;
        const h = canvas.height || height;
        ctx.clearRect(0, 0, w, h);
        if (!hands || hands.length === 0)
            return;
        hands.forEach((hand) => {
            // 1. Draw connecting bone lines
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
                const start = hand[startIdx];
                const end = hand[endIdx];
                if (start && end) {
                    ctx.beginPath();
                    ctx.moveTo(start.x * w, start.y * h);
                    ctx.lineTo(end.x * w, end.y * h);
                    ctx.stroke();
                }
            });
            // 2. Draw keypoint joints
            hand.forEach((pt, idx) => {
                const px = pt.x * w;
                const py = pt.y * h;
                ctx.beginPath();
                const isFingertip = [4, 8, 12, 16, 20].includes(idx);
                ctx.arc(px, py, isFingertip ? 5 : 2.5, 0, Math.PI * 2);
                if (isFingertip) {
                    ctx.fillStyle = idx === 4 || idx === 8 ? '#00f0ff' : '#a855f7';
                    ctx.shadowBlur = 10;
                }
                else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                    ctx.shadowBlur = 4;
                }
                ctx.fill();
            });
        });

        // 3. Draw Targeting Reticle (Pinch or Pointing)
        const activeTarget = (isPinch && pinchPt) ? pinchPt : (isPoint && cursorPt) ? cursorPt : null;
        if (activeTarget) {
            const cx = activeTarget.x * w;
            const cy = activeTarget.y * h;
            // Outer radar pulse circle
            ctx.beginPath();
            ctx.arc(cx, cy, isPinch ? 30 : 22, 0, Math.PI * 2);
            ctx.strokeStyle = isPinch ? '#00f0ff' : '#38bdf8';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 16;
            ctx.stroke();

            // Crosshairs
            ctx.beginPath();
            ctx.moveTo(cx - 10, cy);
            ctx.lineTo(cx + 10, cy);
            ctx.moveTo(cx, cy - 10);
            ctx.lineTo(cx, cy + 10);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner targeting dot
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fillStyle = isPinch ? '#00f0ff' : '#38bdf8';
            ctx.fill();

            // Text label
            ctx.font = '700 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 8;
            ctx.fillText(isPinch ? 'PINCH TO SELECT' : 'AIMING AT PART', cx, cy - 36);
        }
    };
    useImperativeHandle(ref, () => ({
        draw: ({ landmarks: hands, isTwoFingerJoin: isPinch, isTwoFingerRotating = false, isPointing: isPoint = false, cursorPoint: cursorPt = null, isRotationLocked = false, hoveredPartName = '', actionName: action }) => {
            renderToCanvas(hands, isPinch, isPinch ? (cursorPt || pinchPoint) : null, isPoint, cursorPt);
            if (badgeDivRef.current) {
                let text = '';
                let color = '';
                let dot = '';
                if (isRotationLocked) {
                    if (isPinch) {
                        text = '✨ Two Fingers Joined: Inspecting Component';
                        color = 'border-cyan-400 text-cyan-300 bg-cyan-950/85';
                        dot = 'bg-cyan-400 animate-ping';
                    }
                    else if (hoveredPartName) {
                        text = `🎯 Aiming: ${hoveredPartName} • Join Fingers to Inspect`;
                        color = 'border-cyan-400 text-cyan-300 bg-cyan-950/85';
                        dot = 'bg-cyan-400 animate-pulse';
                    }
                    else {
                        text = '🔒 3D Locked (Steady Inspection) • Join Fingers on Component';
                        color = 'border-amber-400 text-amber-300 bg-amber-950/85';
                        dot = 'bg-amber-400';
                    }
                }
                else {
                    if (isPinch) {
                        text = '✨ Two Fingers Joined: Inspecting Component';
                        color = 'border-cyan-400 text-cyan-300 bg-cyan-950/85';
                        dot = 'bg-cyan-400 animate-ping';
                    }
                    else if (action === 'assemble') {
                        text = '✊ Palm Closed: Assembling All Layers';
                        color = 'border-emerald-400 text-emerald-300 bg-emerald-950/85';
                        dot = 'bg-emerald-400 animate-pulse';
                    }
                    else if (action === 'disassemble') {
                        text = '👐 Two Fingers Opened: Disassembling All Layers';
                        color = 'border-purple-400 text-purple-300 bg-purple-950/85';
                        dot = 'bg-purple-400 animate-pulse';
                    }
                    else if (isTwoFingerRotating) {
                        text = '🔄 Two Fingers Move: Rotating 3D Phone (90 FPS)';
                        color = 'border-cyan-400 text-cyan-300 bg-cyan-950/85';
                        dot = 'bg-cyan-400 animate-pulse';
                    }
                    else if (hoveredPartName) {
                        text = `🎯 Aiming: ${hoveredPartName} • Join Fingers to Inspect`;
                        color = 'border-cyan-400 text-cyan-300 bg-cyan-950/85';
                        dot = 'bg-cyan-400 animate-pulse';
                    }
                    else if (isPoint) {
                        text = '🎯 Pointing: Aiming at component';
                        color = 'border-cyan-400 text-cyan-300 bg-cyan-950/85';
                        dot = 'bg-cyan-400 animate-pulse';
                    }
                    else if (hands && hands.length > 0) {
                        text = '🤞 Two Fingers Move: Rotate 3D • 👌 Join Fingers: Inspect';
                        color = 'border-blue-400 text-blue-300 bg-navy-950/85';
                        dot = 'bg-blue-400';
                    }
                }

                if (text !== badgeTextRef.current) {
                    badgeTextRef.current = text;
                    if (text) {
                        badgeDivRef.current.style.display = 'flex';
                        badgeDivRef.current.className = `absolute top-16 left-4 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border shadow-lg ${color}`;
                        badgeDivRef.current.innerHTML = `<span class="w-2 h-2 rounded-full ${dot}"></span><span class="text-xs font-mono font-semibold text-white">${text}</span>`;
                    }
                    else {
                        badgeDivRef.current.style.display = 'none';
                    }
                }
            }
        },
        clear: () => {
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const ctx = canvas.getContext('2d');
            if (ctx)
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (badgeDivRef.current)
                badgeDivRef.current.style.display = 'none';
        },
    }));
    // Fallback props render
    useEffect(() => {
        renderToCanvas(landmarks, isTwoFingerJoin, pinchPoint);
    }, [landmarks, width, height, isTwoFingerJoin, pinchPoint, handAction]);
    return (<div className="absolute inset-0 pointer-events-none z-20">
        <canvas ref={canvasRef} width={width} height={height} className="w-full h-full"/>

        <div ref={badgeDivRef} style={{ display: 'none' }} className="absolute top-16 left-4 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border shadow-lg"/>
      </div>);
};
export const HandOverlay = forwardRef(HandOverlayComponent);
export default HandOverlay;
