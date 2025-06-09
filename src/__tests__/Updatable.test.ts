import {BaseUpdatable, CompleteEventHandler} from "../Updatable.js";
import {UpdatableTestMock} from "../UpdatableMock.js";


describe("UpdatableOnUpdate handler", () => {

    it("should call OnUpdate", () => {
        const updatable = new UpdatableTestMock();
        updatable.update(100);
        expect(updatable.Complete).toBe(true);
    })

    it("should call subscribed event", () => {
        const updatable = new UpdatableTestMock();
        let handlerCalled = false;
        let receivedSender: any = null;

        const testHandler : CompleteEventHandler = (sender ) =>
        {
            handlerCalled = true;
            receivedSender = sender;
        }

        updatable.addOnCompleteListener(testHandler);
        updatable.update(100);
        expect(handlerCalled).toBe(true);
        expect(receivedSender).toBe(updatable);
    })

    it("OnComplete event should call it's subscribers only once", () => {
        const updatable = new UpdatableTestMock();

        let calledCount = 0;

        const testHandler : CompleteEventHandler = (sender ) =>
        {
            calledCount++;
        }
        updatable.addOnCompleteListener(testHandler);
        updatable.update(100);
        updatable.update(100);
        expect(calledCount).toBe(1);
    })

    it("OnComplete subscriber shouldn't be called once removed", () => {
        const updatable = new UpdatableTestMock();

        let calledCount = 0;

        const testHandler : CompleteEventHandler = (sender ) =>
        {
            calledCount++;
        }
        updatable.addOnCompleteListener(testHandler);
        updatable.removeOnCompleteListener(testHandler);
        updatable.update(100);
        expect(calledCount).toBe(0);
    })
})


