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
 * High-Performance Hand Gesture Engine (Optimized for 90 FPS Real-time Tracking)
 * 1. Two-finger touch & open / separate -> Disassemble / Explode all components
 * 2. Palm close / fist -> Assemble all components
 * 3. Two fingers crossed or extended moving -> Ultra-fast 90 FPS 3D model rotation (Zero lag)
 * 4. Two fingers joined (pinched) placed over component -> Inspect & open component details card
 */
export class HandGestureEngine {
    prevRotatePos = null;
    smoothedPalmPos = { x: 0.5, y: 0.5 };
    wasPinching = false;
    pinchHoldStartTime = 0;
    lastActionTime = 0;

    processHands(landmarksList, timestampMs) {
        let handAction = 'neutral';
        let isTwoFingerJoin = false;
        let isTwoFingerRotating = false;
        let pinchPoint = null;
        let deltaHandRotation = { pitch: 0, yaw: 0, x: 0, y: 0 };

        if (!landmarksList || landmarksList.length === 0) {
            this.prevRotatePos = null;
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
                isTwoFingerRotating: false,
                pinchPoint: null,
                deltaHandRotation,
            };
        }

        const hand = landmarksList[0];
        const wrist = hand[0];
        const thumbTip = hand[4];
        const indexMcp = hand[5];
        const indexPip = hand[6];
        const indexTip = hand[8];
        const middleMcp = hand[9];
        const middlePip = hand[10];
        const middleTip = hand[12];
        const ringMcp = hand[13];
        const ringPip = hand[14];
        const ringTip = hand[16];
        const pinkyMcp = hand[17];
        const pinkyPip = hand[18];
        const pinkyTip = hand[20];

        // Palm center point
        const rawPalmX = (wrist.x + middleMcp.x) / 2;
        const rawPalmY = (wrist.y + middleMcp.y) / 2;

        // Snappy EMA smoothing
        this.smoothedPalmPos.x += (rawPalmX - this.smoothedPalmPos.x) * 0.65;
        this.smoothedPalmPos.y += (rawPalmY - this.smoothedPalmPos.y) * 0.65;

        // Reference hand scale
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

        const dIndexTipMcp = Math.hypot(indexTip.x - indexMcp.x, indexTip.y - indexMcp.y);
        const dMiddleTipMcp = Math.hypot(middleTip.x - middleMcp.x, middleTip.y - middleMcp.y);
        const dRingTipMcp = Math.hypot(ringTip.x - ringMcp.x, ringTip.y - ringMcp.y);
        const dPinkyTipMcp = Math.hypot(pinkyTip.x - pinkyMcp.x, pinkyTip.y - pinkyMcp.y);

        const indexCurled = (dWristIndexTip < dWristIndexPip * 1.15) || (dIndexTipMcp < handScale * 0.72);
        const middleCurled = (dWristMiddleTip < dWristMiddlePip * 1.15) || (dMiddleTipMcp < handScale * 0.72);
        const ringCurled = (dWristRingTip < dWristRingPip * 1.15) || (dRingTipMcp < handScale * 0.72);
        const pinkyCurled = (dWristPinkyTip < dWristPinkyPip * 1.15) || (dPinkyTipMcp < handScale * 0.72);

        const curledCount = (indexCurled ? 1 : 0) + (middleCurled ? 1 : 0) + (ringCurled ? 1 : 0) + (pinkyCurled ? 1 : 0);
        const avgTipDistToPalm = (
            Math.hypot(indexTip.x - rawPalmX, indexTip.y - rawPalmY) +
            Math.hypot(middleTip.x - rawPalmX, middleTip.y - rawPalmY) +
            Math.hypot(ringTip.x - rawPalmX, ringTip.y - rawPalmY) +
            Math.hypot(pinkyTip.x - rawPalmX, pinkyTip.y - rawPalmY)
        ) / 4;

        // GESTURE 2: Palm Close / Fist Detection (Robust to all hand angles)
        const isPalmClosed = curledCount >= 3 || avgTipDistToPalm < handScale * 0.58;

        // GESTURE 1 & 4: Two-Finger Join Check (Thumb Tip + Index Tip)
        // CRITICAL: A true pinch requires the hand NOT to be a closed fist!
        const pinchDistance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
        const pinchThreshold = Math.max(0.065, handScale * 0.45);
        const isPinchingNow = !isPalmClosed && (pinchDistance < pinchThreshold);

        if (isPinchingNow) {
            isTwoFingerJoin = true;
            pinchPoint = {
                x: (thumbTip.x + indexTip.x) / 2,
                y: (thumbTip.y + indexTip.y) / 2,
            };
            if (!this.wasPinching) {
                this.pinchHoldStartTime = timestampMs;
            }
        } else {
            // GESTURE 1: Two-finger touch & open -> Disassemble!
            // Transition from touching/joined fingers to open/separated fingers
            if (this.wasPinching && !isPalmClosed) {
                if (timestampMs - this.lastActionTime > 250) {
                    handAction = 'disassemble';
                    this.lastActionTime = timestampMs;
                }
            }
        }
        this.wasPinching = isPinchingNow;

        // GESTURE 2: Palm Close -> Assemble!
        if (isPalmClosed) {
            if (timestampMs - this.lastActionTime > 200) {
                handAction = 'assemble';
                this.lastActionTime = timestampMs;
            }
        }

        // GESTURE 3: Two Fingers Crossed or Extended Moving -> 90 FPS 3D Model Rotation
        // Index and middle fingers extended; ring and pinky curled
        const isTwoFingersExtended = !indexCurled && !middleCurled && (ringCurled || pinkyCurled);
        const dIndexMiddle = Math.hypot(indexTip.x - middleTip.x, indexTip.y - middleTip.y);
        // Crossed fingers or close together extended
        const isTwoFingersCrossed = isTwoFingersExtended && (dIndexMiddle < handScale * 0.45 || (indexTip.x - indexPip.x) * (middleTip.x - middlePip.x) < 0);
        // Rotate mode active if two fingers extended/crossed, and NOT joined/pinching, and NOT closed fist
        const canRotate = (isTwoFingersExtended || isTwoFingersCrossed) && !isPinchingNow && !isPalmClosed;

        if (canRotate) {
            isTwoFingerRotating = true;
            // Midpoint of index tip and middle tip for pinpoint rotational tracking
            const rotateX = (indexTip.x + middleTip.x) / 2;
            const rotateY = (indexTip.y + middleTip.y) / 2;

            if (this.prevRotatePos) {
                const rawDx = rotateX - this.prevRotatePos.x;
                const rawDy = rotateY - this.prevRotatePos.y;

                // Ultra-low deadzone (0.002) for instant 90 FPS responsiveness without jitter
                if (Math.abs(rawDx) > 0.002 || Math.abs(rawDy) > 0.002) {
                    // Mirrored camera feed: physical right is -rawDx
                    const yawVal = -rawDx * 4.6;
                    const pitchVal = rawDy * 3.8;
                    deltaHandRotation = {
                        pitch: pitchVal,
                        yaw: yawVal,
                        x: pitchVal,
                        y: yawVal,
                    };
                }
            }
            this.prevRotatePos = { x: rotateX, y: rotateY };
        } else {
            this.prevRotatePos = null;
        }

        const isPointing = !indexCurled && middleCurled && ringCurled && pinkyCurled;
        const isOpenPalm = !indexCurled && !middleCurled && !ringCurled && !pinkyCurled;

        return {
            state: {
                currentGesture: isTwoFingerJoin
                    ? 'pinch'
                    : isTwoFingerRotating
                        ? 'two_finger_rotate'
                        : isPalmClosed
                            ? 'fist'
                            : isPointing
                                ? 'point'
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
            isTwoFingerRotating,
            isPointing,
            isOpenPalm,
            pinchPoint,
            cursorPoint: pinchPoint || { x: indexTip.x, y: indexTip.y },
            deltaHandRotation,
        };
    }
}
