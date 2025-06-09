import {OnTickEventHandler, Ticker} from '../Ticker.js';

describe("Ticker Class Creation", () => {
    it("should create a new ticker", () => {
        const tickerResult = Ticker.create({delayMS: 100, times: 2});
        expect(tickerResult.success).toBe(true);

        if (tickerResult.success)
        {
            const ticker: Ticker = tickerResult.ticker;
            expect(ticker).toBeDefined();
            expect(ticker).not.toBeNull();
        }


    })

    it('should be instance of Ticker', () => {
        const tickerResult = Ticker.create({delayMS: 100, times: 2});
        expect(tickerResult.success).toBe(true);

        if (tickerResult.success)
        {
            const ticker: Ticker = tickerResult.ticker;
            expect(ticker).toBeInstanceOf(Ticker);
        }
    });

    it('should fire Tick Event when time comes.', () => {

        const tickerResult = Ticker.create({delayMS: 10, times: 5});
        expect(tickerResult.success).toBe(true);

        if (!tickerResult.success)
        {
          fail("Ticker creation failed");
        }

        const ticker: Ticker = tickerResult.ticker;
        let handlerCalled = false;
        let receivedSender: any = null;

        const tickHandler : OnTickEventHandler = (sender) => {
            handlerCalled = true;
            receivedSender = sender;
        }

        ticker.addOnTickEventListener (tickHandler);
        ticker.update(50);

        expect(handlerCalled).toBe(true);
        expect(receivedSender).toBe(ticker);
    });

    it('should chain fire Tick Events if enough time passed to fire more then 1.', () => {

        const tickerResult = Ticker.create({delayMS: 10, times: 20});
        expect(tickerResult.success).toBe(true);

        if (!tickerResult.success)
        {
            fail("Ticker creation failed");
        }

        const ticker: Ticker = tickerResult.ticker;
        let timesCalled = 0;


        const tickHandler : OnTickEventHandler = (sender) => {
           timesCalled++;
        }

        ticker.addOnTickEventListener (tickHandler);
        ticker.update(45);

        expect(timesCalled).toBe(4);
    });

    it('fireOnFirstUpdate parameter should not change amount of events fired at specific time. Only the expected time.', () => {

        const tickerResult = Ticker.create({delayMS: 10, times: 10, fireOnFirstUpdate: true});
        expect(tickerResult.success).toBe(true);

        if (!tickerResult.success)
        {
            fail("Ticker creation failed");
        }

        const ticker: Ticker = tickerResult.ticker;
        let timesCalled = 0;


        const tickHandler : OnTickEventHandler = (sender) => {
            timesCalled++;
        }

        ticker.addOnTickEventListener (tickHandler);
        ticker.update(65);

        expect(timesCalled).toBe(6);
    });

    it('should fail the creation if parameters are wrong', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const tickerResult = Ticker.create({delayMS: 0, times: 0});
            expect(tickerResult.success).toBe(false);
        consoleErrorSpy.mockRestore()
    });
})