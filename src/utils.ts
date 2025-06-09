import {optional, z} from "zod";

export type AsyncVoidFunction = () => Promise<void>;

export const AsyncVoidFunctionSchema = z.function()
    .args()
    .returns(z.promise(z.void()));

export function delay(ms: number, resolveIfAborted : boolean = false, signal?: AbortSignal): Promise<void> {

    return new Promise<void>(
        (resolve, reject) => {

        if (ms < 0) {
             return reject(new Error('Delay duration cannot be negative'));
        }

        if (signal?.aborted) {
            return resolveIfAborted ? resolve : reject(createDOMEException());
        }

        let timeoutId: NodeJS.Timeout; // any or Maybe <typeOf setTimeout> For NodeJS and browser? Ok for assigment.

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

function createDOMEException(): DOMException {
  return new DOMException('Delay cancelled', 'AbortError');
}