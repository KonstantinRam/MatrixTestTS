import {delay} from "../utils.js";

describe('Delay Util', () => {

    it('delay should reject if aborted during execution',
        async () => {
        const abortController = new AbortController();
        setTimeout(() => {
            abortController.abort("Because I Can");
        }, 10);

        await expect(delay(100, false, abortController.signal))
            .rejects
            .toThrow
            ("Delay cancelled");

    })

    it('delay should reject if abort signal comes already fired',
        async () => {
        const abortController = new AbortController();

        abortController.abort("Because I Can");

        await expect(delay(100,false, abortController.signal))
            .rejects
            .toThrow('Delay cancelled');

    })

    it('delay should unsubscribe from abort Signal if it was resolved',
        async () => {
            const abortController = new AbortController();

            const addListenerSpy = jest.spyOn(abortController.signal, 'removeEventListener');
            await delay(10, false, abortController.signal);
            expect(addListenerSpy).toHaveBeenCalled();

    })

    it('delay should unsubscribe from abort Signal if it was canceled',
        async () => {
            const abortController = new AbortController();

            const addListenerSpy = jest.spyOn(abortController.signal, 'removeEventListener');

            setTimeout(() => {
                abortController.abort("Because I Can");
            }, 10);
            await expect(delay(100,false, abortController.signal))
                .rejects
                .toThrow('Delay cancelled');
            expect(addListenerSpy).toHaveBeenCalled()
        })

    it('delay should Resolve even if Signal was aborted if "resolveIfAborted" set to true',
        async () => {
            const abortController = new AbortController();

            setTimeout(() => {
                abortController.abort("Because I Can");
            }, 10);
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
                await delay(100,true, abortController.signal);
            consoleErrorSpy.mockRestore()
        })
})