import {BaseRunner} from '../Runner.js';
import {delay} from "../utils.js";
import {RunnerState} from "../RunnerState.js";

describe('BaseRunner', () => {

    it('should fail creation if empty debug ID provided', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const runnerCreated = BaseRunner.create({debugId: "", abortSignal: new AbortController().signal});
            expect(runnerCreated.success).toBe(false);
        consoleErrorSpy.mockRestore()
    });

    it('workAssigned should return false if no work assigned', () => {
       const runnerCreated = BaseRunner.create({debugId: "test", abortSignal: new AbortController().signal});
        if (!runnerCreated.success)
        {
            fail("Runner creation failed");
        }
        const runner = runnerCreated.runner;
        expect(runner.workAssigned()).toBe(false);
    });

    it('workAssigned should return true if work was assigned', () => {
        const runnerCreated = BaseRunner.create({debugId: "test", abortSignal: new AbortController().signal});
        if (!runnerCreated.success)
        {
            fail("Runner creation failed");
        }

        const runner = runnerCreated.runner;
        runner.assign(async () => {}, async () => {});
        expect(runner.workAssigned()).toBe(true);
    });

    it('should do work if runner was started', () => {
        const runnerCreated = BaseRunner.create({debugId: "test", abortSignal: new AbortController().signal});
        if (!runnerCreated.success)
        {
            fail("Runner creation failed");
        }

        const runner = runnerCreated.runner;
        let _workCalled = false;
        runner.assign(async () => {
           _workCalled = true;
           await delay(30);

        }, async () => {});
        runner.start();
        runner.stop()
        expect(_workCalled).toBe(true);
    });

    it('should present Ready state when just created', () => {
        const runnerCreated = BaseRunner.create({debugId: "test", abortSignal: new AbortController().signal});
        if (!runnerCreated.success)
        {
            fail("Runner creation failed");
        }

        const runner = runnerCreated.runner;

        expect(runner.getState() === RunnerState.Ready);
    });

    it('should present running state when just started', () => {
        const runnerCreated = BaseRunner.create({debugId: "test", abortSignal: new AbortController().signal});
        if (!runnerCreated.success)
        {
            fail("Runner creation failed");
        }

        const runner = runnerCreated.runner;
        runner.assign(async () => {}, async () => {});
        runner.start();
        let state = runner.getState();
        runner.stop();
        expect(state === RunnerState.Running);
    });
});