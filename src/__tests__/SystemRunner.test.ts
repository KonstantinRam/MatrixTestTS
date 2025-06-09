import {BaseSystemRunner} from "../SystemRunner.js";
import {UpdatableTestMock} from "../UpdatableMock.js";
import {delay} from "../utils.js";


describe('SystemRunner', () => {
    it('should be created', () => {
        const runnerCreated = BaseSystemRunner.create({deltaTimeMs: 0.5, abortSignal: new AbortController().signal, runner: null} );
        expect(runnerCreated.success).toBe(true);
    });

    it('should increment amount of tasks running once new one pushed', () => {

        const runnerCreated = BaseSystemRunner.create({deltaTimeMs: 0.5, abortSignal: new AbortController().signal, runner: null} );
        if (!runnerCreated.success)
        {
            fail("Runner creation failed");
        }
        let sr = runnerCreated.systemRunner;
        const updatableMock0 = new UpdatableTestMock();
        const updatableMock1 = new UpdatableTestMock();
        sr.push(updatableMock0);
        sr.push(updatableMock1);

        expect(sr.getTasksAmount()).toBe(2);
    });

    it('should run update on submitted updatable', async () => {
        const runnerCreated = BaseSystemRunner.create({deltaTimeMs: 10.5, abortSignal: new AbortController().signal, runner: null} );
        if (!runnerCreated.success)
        {
            fail("Runner creation failed");
        }

        let sr = runnerCreated.systemRunner as BaseSystemRunner;
        if (sr as BaseSystemRunner == null)
        {
            fail("Runner creation failed");
        }
        const updatableMock0 = new UpdatableTestMock();
        sr.push(updatableMock0);
        sr.start();
        await delay(20);
        sr.stop();

        expect(updatableMock0.Complete).toBe(true);
    });

    it('should not update updatable if not started', () => {
        const runnerCreated = BaseSystemRunner.create({deltaTimeMs: 12, abortSignal: new AbortController().signal, runner: null} );
        if (!runnerCreated.success)
        {
            fail("Runner creation failed");
        }

        let sr = runnerCreated.systemRunner as BaseSystemRunner;
        if (sr as BaseSystemRunner == null)
        {
            fail("Runner creation failed");
        }
        const updatableMock0 = new UpdatableTestMock();
        sr.push(updatableMock0);


        expect(updatableMock0.Complete).toBe(false);
    });

    it('should remove updatable from task list once they are complete', async () => {
        const runnerCreated = BaseSystemRunner.create({deltaTimeMs: 10, abortSignal: new AbortController().signal, runner: null} );
        if (!runnerCreated.success)
        {
            fail("Runner creation failed");
        }

        let sr = runnerCreated.systemRunner as BaseSystemRunner;
        if (sr as BaseSystemRunner == null)
        {
            fail("Runner creation failed");
        }
        const updatableMock = new UpdatableTestMock();
        sr.push(updatableMock);
        sr.start();
        await delay(18);
        sr.stop();

        expect(sr.hasAnyTasks()).toBe(false);
    });

    it('should not affect AbortController provided on creation if .stop called', () => {
        const ac = new AbortController();
        const runnerCreated = BaseSystemRunner.create({deltaTimeMs: 10, abortSignal: ac.signal, runner: null} );
        if (!runnerCreated.success)
        {
            fail("Runner creation failed");
        }

        let sr = runnerCreated.systemRunner as BaseSystemRunner;
        if (sr as BaseSystemRunner == null)
        {
            fail("Runner creation failed");
        }
        console.log(sr.getState());
        sr.start();
        sr.stop();

        expect(ac.signal.aborted).toBe(false);
    });
})