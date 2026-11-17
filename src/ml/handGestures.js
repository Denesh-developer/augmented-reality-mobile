import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
let handLandmarkerPromise = null;
export async function getHandLandmarker() {
    if (!handLandmarkerPromise) {
        handLandmarkerPromise = (async () => {
            const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm');
            const landmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                    delegate: 'GPU',
                },
                runningMode: 'VIDEO',
                numHands: 1, // Single hand for ultra-high FPS and zero lag
                minHandDetectionConfidence: 0.55,
                minHandPresenceConfidence: 0.55,
                minTrackingConfidence: 0.55,
            });
            return landmarker;
        })();
    }
    return handLandmarkerPromise;
}
// Hand bone connections for skeleton overlay
export const HAND_CONNECTIONS = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // Palm Base
    [5, 9], [9, 13], [13, 17],
];
/**
 * Enhanced Two-Finger Precision Gesture Engine
 * Exactly tailored to user request:
 * 1. Two-finger touch & release / separate -> Disassemble / Explode all components
 * 2. Two-finger touch held over a component -> Inspect & animate component specs card
 * 3. Two-finger double-touch & move -> Reassemble all components
 * 4. Hand movement -> Rotate 3D model
 */
export class HandGestureEngine {
    prevPalmPos = null;
    smoothedPalmPos = { x: 0.5, y: 0.5 };
    wasPinching = false;
    lastPinchTime = 0;
    pinchTapCount = 0;
    lastActionTime = 0;
    processHands(landmarksList, timestampMs) {
        let handAction = 'neutral';
        let isTwoFingerJoin = false;
        let pinchPoint = null;
        let deltaHandRotation = { pitch: 0, yaw: 0, x: 0, y: 0 };
        if (!landmarksList || landmarksList.length === 0) {
            this.prevPalmPos = null;
            return {
                state: {
                    currentGesture: 'none',
                    confidence: 0,
                    holdingProgress: 0,
                    handPosition: null,
                    cursorPosition: null,
                    isTwoHanded: false,
                },
                landmarks: [],
                handAction: 'neutral',
                isTwoFingerJoin: false,
                pinchPoint: null,
                deltaHandRotation,
            };
        }
        const hand = landmarksList[0];
        const wrist = hand[0];
        const thumbTip = hand[4];
        const indexPip = hand[6];
        const indexTip = hand[8];
        const middleMcp = hand[9];
        const middlePip = hand[10];
        const middleTip = hand[12];
        const ringPip = hand[14];
        const ringTip = hand[16];
        const pinkyPip = hand[18];
        const pinkyTip = hand[20];
        // Palm center point (midpoint of wrist and middle MCP)
        const rawPalmX = (wrist.x + middleMcp.x) / 2;
        const rawPalmY = (wrist.y + middleMcp.y) / 2;
        // Fast exponential smoothing (EMA) for butter-smooth movement
        this.smoothedPalmPos.x += (rawPalmX - this.smoothedPalmPos.x) * 0.5;
        this.smoothedPalmPos.y += (rawPalmY - this.smoothedPalmPos.y) * 0.5;
        // Reference hand scale (distance from wrist to middle MCP knuckle)
        const handScale = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y);
        // Check finger curling states
        const dWristIndexTip = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
        const dWristIndexPip = Math.hypot(indexPip.x - wrist.x, indexPip.y - wrist.y);
        const dWristMiddleTip = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);
        const dWristMiddlePip = Math.hypot(middlePip.x - wrist.x, middlePip.y - wrist.y);
        const dWristRingTip = Math.hypot(ringTip.x - wrist.x, ringTip.y - wrist.y);
        const dWristRingPip = Math.hypot(ringPip.x - wrist.x, ringPip.y - wrist.y);
        const dWristPinkyTip = Math.hypot(pinkyTip.x - wrist.x, pinkyTip.y - wrist.y);
        const dWristPinkyPip = Math.hypot(pinkyPip.x - wrist.x, pinkyPip.y - wrist.y);

        const indexCurled = dWristIndexTip < dWristIndexPip * 1.05;
        const middleCurled = dWristMiddleTip < dWristMiddlePip * 1.05;
        const ringCurled = dWristRingTip < dWristRingPip * 1.05;
        const pinkyCurled = dWristPinkyTip < dWristPinkyPip * 1.05;

        const isClosedFist = (indexCurled ? 1 : 0) + (middleCurled ? 1 : 0) + (ringCurled ? 1 : 0) + (pinkyCurled ? 1 : 0) >= 3;
        const isPointing = !indexCurled && middleCurled && ringCurled;
        const isOpenPalm = !indexCurled && !middleCurled && !ringCurled;

        // 1. Two-Finger Join Check (Thumb Tip + Index Tip)
        const pinchDistance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
        const pinchThreshold = Math.max(0.065, handScale * 0.45);
        const isPinchingNow = pinchDistance < pinchThreshold;

        if (isPinchingNow) {
            isTwoFingerJoin = true;
            pinchPoint = {
                x: (thumbTip.x + indexTip.x) / 2,
                y: (thumbTip.y + indexTip.y) / 2,
            };
            // Check for double touch (double-tap within 500ms)
            if (!this.wasPinching) {
                const timeSinceLastPinch = timestampMs - this.lastPinchTime;
                if (timeSinceLastPinch < 500) {
                    // Double-touch: Assemble everything!
                    this.pinchTapCount = 2;
                    handAction = 'assemble';
                    this.lastActionTime = timestampMs;
                }
                else {
                    this.pinchTapCount = 1;
                }
                this.lastPinchTime = timestampMs;
            }
        }
        else {
            // Fingers just released / separated!
            if (this.wasPinching) {
                // Touch and remove/separate fingers -> Disassemble / Explode!
                if (this.pinchTapCount === 1 && timestampMs - this.lastActionTime > 280) {
                    handAction = 'disassemble';
                    this.lastActionTime = timestampMs;
                }
            }
        }
        this.wasPinching = isPinchingNow;

        // 2. Hand Movement -> Rotate 3D Model ONLY if NOT pointing or pinching!
        // When pointing or pinching, rotation is locked so the user can easily select components!
        if (this.prevPalmPos && !isPinchingNow && !isPointing) {
            const rawDx = rawPalmX - this.prevPalmPos.x;
            const rawDy = rawPalmY - this.prevPalmPos.y;
            // Deadzone to filter tremors (0.006)
            if (Math.abs(rawDx) > 0.006 || Math.abs(rawDy) > 0.006) {
                // Video is mirrored horizontally with CSS scaleX(-1).
                // Moving hand physically RIGHT decreases rawPalmX (rawDx < 0).
                // Smooth, comfortable sensitivity
                const yawVal = -rawDx * 3.5;
                const pitchVal = rawDy * 2.8;
                deltaHandRotation = {
                    pitch: pitchVal,
                    yaw: yawVal,
                    x: pitchVal,
                    y: yawVal,
                };
            }
        }
        this.prevPalmPos = { x: rawPalmX, y: rawPalmY };

        // 3. Fallback Fist check (if user also closes fist to assemble)
        if (isClosedFist && timestampMs - this.lastActionTime > 350 && !isPinchingNow) {
            handAction = 'assemble';
            this.lastActionTime = timestampMs;
        }
        return {
            state: {
                currentGesture: isTwoFingerJoin
                    ? 'pinch'
                    : isPointing
                        ? 'point'
                        : isClosedFist
                            ? 'fist'
                            : 'none',
                confidence: 0.95,
                holdingProgress: isTwoFingerJoin ? 1.0 : 0,
                handPosition: this.smoothedPalmPos,
                cursorPosition: pinchPoint || { x: indexTip.x, y: indexTip.y },
                isTwoHanded: false,
            },
            landmarks: landmarksList,
            handAction,
            isTwoFingerJoin,
            isPointing,
            isOpenPalm,
            pinchPoint,
            cursorPoint: pinchPoint || { x: indexTip.x, y: indexTip.y },
            deltaHandRotation,
        };
    }
}
