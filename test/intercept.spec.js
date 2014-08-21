describe('Testing AJAX intercepting', function() {
    describe('Basic functionality', function() {
        var originalTimeout;
        var result;
        var interceptor = INTERCEPTOR();
        var DEFAULT_ADDRESS = 'http://localhost:2424/callme';

        beforeEach(function (done) {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 6000;
            interceptor.activate();
            setTimeout(function() {
                done();
            }, 1);

        });

        afterEach(function (done) {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
            
            interceptor.deactivate();
            result = null;

            setTimeout(function() {
                done();
            }, 1);
        });
        
        it('should intercept the ', function (done) {

            var xhr = new XMLHttpRequest();
            xhr.open('GET', DEFAULT_ADDRESS, true);
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4 && xhr.status === 200) {
                    result = JSON.parse(xhr.responseText);
                }
            };
            xhr.send();

            interceptor.dispatchReadyStateChange(xhr, {
                readyState: 4,
                status: 200,
                timeout: 300,
                responseText: JSON.stringify({msg: 'hello darling'})
            });

            setTimeout(function() {
                expect(result).not.toBe(null);
                done();
            }, 1000);
        });
    });

    describe('testing non-intercepting options', function() {
        var originalTimeout;
        var result = null;
        var interceptor = INTERCEPTOR();
        var defaultUrlPattern = /^http:\/\/localhost(:[0-9]+)?\/?(\/[.\w]*)*$/;

        beforeEach(function (done) {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 6000;
            interceptor.activate({
                urlPattern: /^http:\/\/localhost(:[0-9]+)?\/?(\/[.\w]*)*$/
            });

            setTimeout(function() {
                done();
            }, 1);

        });

        afterEach(function (done) {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
            
            if(interceptor) {
                interceptor.deactivate();
            }

            setTimeout(function() {
                done();
            }, 1);
        });

        it('should intercept localhost urls', function() {

            var testString = 'hello darling';
            var address = 'http://localhost:2424/callme';

            var xhr = new XMLHttpRequest();
            xhr.open('GET', address, true);
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4 && xhr.status === 200) {
                    result = xhr.responseText;
                }
            };
            xhr.send();

            interceptor.dispatchReadyStateChange(xhr, {
                readyState: 4,
                status: 200,
                timeout: 300,
                responseText: testString
            });

            setTimeout(function() {
                expect(result).toEqual(testString);
                done();
            }, 1000);
        });

        it('should not intercept urls other than localhost', function() {

            var testString = 'hello darling';
            var address = 'http://google.com';

            var xhr = new XMLHttpRequest();
            xhr.open('GET', address, true);
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4 && xhr.status === 200) {
                    result = xhr.responseText;
                }
            };
            xhr.send();

            interceptor.dispatchReadyStateChange(xhr, {
                readyState: 4,
                status: 200,
                timeout: 300,
                responseText: testString
            });

            setTimeout(function() {
                expect(result).toEqual(testString);
                done();
            }, 1000);
        });
    });
});