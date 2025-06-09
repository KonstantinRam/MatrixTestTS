import { z } from "zod";
export const AsyncVoidFunctionSchema = z.function()
    .args()
    .returns(z.promise(z.void()));
export function delay(ms, resolveIfAborted = false, signal) {
    return new Promise((resolve, reject) => {
        if (ms < 0) {
            return reject(new Error('Delay duration cannot be negative'));
        }
        if (signal?.aborted) {
            return resolveIfAborted ? resolve : reject(createDOMEException());
        }
        let timeoutId; // any or Maybe <typeOf setTimeout> For NodeJS and browser? Ok for assigment.
        const cleanup = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            signal?.removeEventListener('abort', onAbort);
        };
        const onAbort = () => {
            cleanup();
            resolveIfAborted ? resolve() : reject(createDOMEException());
        };
        timeoutId = setTimeout(() => {
            cleanup();
            resolve();
        }, ms);
        if (signal) {
            signal.addEventListener('abort', onAbort, { once: true });
            if (signal.aborted) {
                cleanup();
                resolveIfAborted ? resolve() : reject(createDOMEException());
                return;
            }
        }
    });
}
function createDOMEException() {
    return new DOMException('Delay cancelled', 'AbortError');
}
//# sourceMappingURL=utils.js.map