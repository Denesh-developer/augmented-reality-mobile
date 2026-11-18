import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
let modelPromise = null;
/**
 * Loads the COCO-SSD object detection model lazily
 */
export async function loadDetectionModel() {
    if (!modelPromise) {
        modelPromise = (async () => {
            // Ensure WebGL backend is initialized
            await tf.ready();
            return cocoSsd.load({ base: 'lite_mobilenet_v2' });
        })();
    }
    return modelPromise;
}
/**
 * Detects "cell phone" in a live video element
 */
export async function detectPhoneInVideo(video) {
    if (!video || video.readyState < 2) {
        return { detected: false, score: 0, bbox: [0, 0, 0, 0], aspectRatio: 1 };
    }
    try {
        const model = await loadDetectionModel();
        // Reliable threshold (0.48) to avoid false positives when no phone is shown
        const predictions = await model.detect(video, 5, 0.48);
        // Look for genuine "cell phone" with reasonable physical size in camera
        const phonePred = predictions.find(
            (p) => p.class === 'cell phone' && p.bbox && p.bbox[2] >= 50 && p.bbox[3] >= 70
        );
        if (phonePred && phonePred.bbox) {
            const [x, y, width, height] = phonePred.bbox;
            const aspectRatio = height > 0 ? width / height : 1;
            // Extract cropped canvas of the phone region for OCR
            let croppedCanvas;
            try {
                croppedCanvas = document.createElement('canvas');
                const cropW = Math.max(10, Math.floor(width));
                const cropH = Math.max(10, Math.floor(height));
                croppedCanvas.width = cropW;
                croppedCanvas.height = cropH;
                const ctx = croppedCanvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, Math.max(0, x), Math.max(0, y), cropW, cropH, 0, 0, cropW, cropH);
                }
            }
            catch {
                // In case of any cross-origin video restrictions
            }
            return {
                detected: true,
                score: phonePred.score,
                bbox: [x, y, width, height],
                aspectRatio,
                croppedCanvas,
            };
        }
    }
    catch (err) {
        console.warn('Detection error:', err);
    }
    return { detected: false, score: 0, bbox: [0, 0, 0, 0], aspectRatio: 1 };
}
