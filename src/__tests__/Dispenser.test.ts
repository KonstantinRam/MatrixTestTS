import {BaseDispenser} from "../Dispencer.js";
import {SystemRunnerMock} from "../SystemRunnerMock.js";
import {RunnerState} from "../RunnerState.js";

describe('Dispenser', () => {

    it('should create', () => {
        const dispenserCreated = BaseDispenser.create({systemRunner: new SystemRunnerMock(), delayTimeMs: 20, runner: null,  abortSignal: new AbortController().signal});
      if (!dispenserCreated.success)
      {
          fail("Dispenser creation failed");
      }

      let dispenser = dispenserCreated.dispenser;
      expect(dispenser).toBeDefined();
      expect(dispenser).not.toBeNull();
      dispenser.stop()
    })

    it('should be running right after creation', () => {
        const dispenserCreated = BaseDispenser.create({systemRunner: new SystemRunnerMock(), delayTimeMs: 20, runner: null,  abortSignal: new AbortController().signal});
        if (!dispenserCreated.success)
        {
            fail("Dispenser creation failed");
        }

        let dispenser = dispenserCreated.dispenser;

        expect(dispenser.getState()).toBe(RunnerState.Running);
        dispenser.stop()
    });
})