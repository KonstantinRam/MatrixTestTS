import {Mover} from '../Mover.js';

describe('Mover', () => {

    it('should create', () => {
        const moverCreated = Mover.create({start: 1, end: 10, rate: 0.25});
        if (!moverCreated.success)
        {
            fail("Mover creation failed");
        }
        expect(moverCreated.mover).toBeDefined();
        expect(moverCreated.mover).not.toBeNull();
    })

    it('should return correct value when moving in ascending direction', () => {
        const moverCreated = Mover.create({start: 1, end: 10, rate: 0.25});
        if (!moverCreated.success)
        {
            fail("Mover creation failed");
        }
        let mover = moverCreated.mover;
        expect(mover.getValue()).toBe(1);
        mover.update(2);
        expect(mover.getValue()).toBe(1.5);
    });

    it('should return correct value when moving in descending direction', () => {
        const moverCreated = Mover.create({start: 10, end: 1, rate: -0.25});
        if (!moverCreated.success)
        {
            fail("Mover creation failed");
        }
        let mover = moverCreated.mover;
        mover.update(2);
        expect(mover.getValue()).toBe(9.5);
    })

    it('should fail the creation if starting value is above end, but rate is positive', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const moverCreated = Mover.create({start: 10, end: 1, rate: 1.2});
            expect(moverCreated.success).toBe(false);
        consoleErrorSpy.mockRestore()
    })

    it('should fail the creation if starting value below end, but rate is negative', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const moverCreated = Mover.create({start: 1, end: 10, rate: -1.2});
            expect(moverCreated.success).toBe(false);
        consoleErrorSpy.mockRestore()
    });
})