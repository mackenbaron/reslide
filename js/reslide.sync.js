var Reslide = Reslide || {};

Reslide.sync = new function() {
    this.REFRESH_READ_MILLISECONDS = 1000;
    this.REFRESH_WRITE_MILLISECONDS = 2000;

    this.presenterId = null;
    this.presentationId = null;
    this.intervalId = null;
    this.callback = null;
    this.callbackContext = null;

    // Source: https://stackoverflow.com/a/21903119/29827
    this.getUrlParam = function(theParam) {
        var aPageURL = decodeURIComponent(window.location.search.substring(1)),
            aURLVariables = aPageURL.split('&'),
            aParameterName,
            i;

        for (i = 0; i < aURLVariables.length; i++) {
            aParameterName = aURLVariables[i].split('=');

            if (aParameterName[0] === theParam) {
                return aParameterName[1] === undefined ? true : aParameterName[1];
            }
        }
    };

    this.onSuccess = function(theData) {
        //console.debug('Reslide.sync.onSuccess()', theData);

        if(Reslide.sync.callback) {
            Reslide.sync.callback.call(Reslide.sync.callbackContext, theData);
        } else {
            console.error('Reslide.sync.onSuccess() - no good:', theData.message);
        }
    };

    this.onFail = function(theJqXHR, theTextStatus, theErrorThrown) {
        console.error('Reslide.sync.onFail()', theErrorThrown);
    };

    this.doAjax = function(theData) {
        $.ajax({
            url: '../api/',
            data: theData,
            dataType: 'json'
        }).done(Reslide.sync.onSuccess).fail(Reslide.sync.onFail);
    };

    this.write = function(theSlide) {
        Reslide.sync.doAjax({method: 'write', presenter: Reslide.sync.presenterId, slide: theSlide || Reslide.view.pageNum});
    };

    this.read = function() {
        Reslide.sync.doAjax({method: 'read', id: Reslide.sync.presentationId});
    };

    this.startStream = function(theStreamFunction, theCallback, theCallbackContext, theTime) {
        this.callback = theCallback;
        this.callbackContext = theCallbackContext;
        this.intervalId = setInterval(theStreamFunction, theTime);
    }

    this.startReadingStream = function(thePresentationId, theCallback, theCallbackContext) {
        this.presentationId = thePresentationId;
        this.startStream(this.read, theCallback, theCallbackContext, Reslide.sync.REFRESH_READ_MILLISECONDS);
    };

    this.startWritingStream = function(thePresentationId, thePresenterId, theCallback, theCallbackContext) {
        this.presenterId = thePresenterId;
        this.presentationId = thePresentationId;
        this.startStream(this.write, theCallback, theCallbackContext, Reslide.sync.REFRESH_WRITE_MILLISECONDS);
    };
};
