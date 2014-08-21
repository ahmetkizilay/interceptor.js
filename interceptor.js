/** 
 * Basic idea is taken from this source
 * http://ajaxref.com/ch7/xhrhijackfullprototype.html
 */
var INTERCEPTOR = function(options) {
    "use strict";

    options = options || {
        debug: false
    };

    // flag if it is active or not
    var _active = false;
    var _urlPattern;
    var _blocking = true;



    // storing the actual XHR argument to restore it and reuse it.
    var RealXHR = XMLHttpRequest;
    
    // this is the method that will take over the XHR.
    // keeps a reference to the original XHR so that it can
    // let the request go through when needed.
    var FakeXHR = function() {
        this.real = new RealXHR();
        this.real.parent = this;
        this.real.onreadystatechange = function() {
            this.parent.readyState = this.readyState;
            this.parent.status = this.status;
            this.parent.responseText = this.responseText;

            if(this.parent.onreadystatechange) {
                this.parent.onreadystatechange();
            }
        };

        return this;
    };

    FakeXHR.prototype.status = 0;
    FakeXHR.prototype.readyState = 9;
    FakeXHR.prototype.responseText = 'nice';

    FakeXHR.prototype.open = function (method, url, async, user, pass) {
        _log('fake open');

        if(_urlPattern && !_urlPattern.test(url)) {
            _blocking = false;
            _log('open', 'letting it through');
            this.real.open.call(this.real, method, url, async, user, pass);

            this.readyState = this.real.readyState;
            this.status = this.real.status;
            this.responseText = this.real.responseText;

        }
        else {
            _log('open', 'blocked');
            this.readyState = 1;
        }

        if(this.onreadystatechange) {
            this.onreadystatechange();
        }
    };

    FakeXHR.prototype.send = function (data) {
        _log('fake send');
        var prevState = this.readyState;

        if(!_blocking) {
            _log('send', 'letting it through');
            this.real.send.call(this.real, data);

            this.readyState = this.real.readyState;
            this.status = this.real.status;
            this.responseText = this.real.responseText;
        }
        else {
            _log('send', 'blocked');
        }

        if(prevState !== this.readyState && this.onreadystatechange) {
            this.onreadystatechange();
        }
    };

    // overrides XHR to hijack its functionality
    var _activate = function(opts) {
        opts = opts || {};

        _urlPattern = opts.urlPattern;

        XMLHttpRequest = FakeXHR;
        _active = true;
    };

    // returns XHR in its original form
    var _deactivate = function() {
        XMLHttpRequest = RealXHR;
        _active = false;
    };

    /**
        used for triggering the onreadystatechange listener
        it lets you set the readyState, status, responseText properties.
        also you can specify how long to wait before triggering the event.
     */
    var _dispatchReadyStateChange = function (xhr, options) {
        if(!_active) {
            console.log('INTERCEPTOR is not activated');
            return;
        }

        options = options || {};
        options.timeout = 300;

        xhr.readyState = options.readyState || 0;
        xhr.status = options.status || 0;
        xhr.responseText = options.responseText || '';

        if(xhr.onreadystatechange) {
            setTimeout(function() {
                xhr.onreadystatechange();
            }, options.timeout, 1);
        }
    };

    /**
        Simply logging in debug mode.
     */
    var _log = function() {
        if(options.debug) {
            console.log(arguments);
        }
    };

    return {
        activate: _activate,
        deactivate: _deactivate,
        dispatchReadyStateChange: _dispatchReadyStateChange
    };
};