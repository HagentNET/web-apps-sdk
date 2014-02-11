describe("Helper.Site", function() {

    describe("Helper.Site.getAccessToken", function(){
        
        function _fakeGetCurrentLocation(location){
            spyOn(BCAPI.Helper.Http, "getCurrentLocation").andCallFake(function(){
                var link = document.createElement("a");
                link.href = location;
                return link;
            });
        }

        it("Test if no $.cookie", function(){     
            spyOn($, "error");

            BCAPI.Helper.Site.getAccessToken();
            expect($.error).toHaveBeenCalled();
        });
     
        it("Test it gets token from hash parameters", function(){
            spyOn($, "cookie").andCallFake(function(){return undefined;});

            _fakeGetCurrentLocation("http://businesscatalyst.com#access_token=febf7b6a027");

            expect(BCAPI.Helper.Site.getAccessToken()).toBe('febf7b6a027');
            expect($.cookie).toHaveBeenCalled();
        });

        it("Test token is set in cookie with expiration from hash parameter", function(){
            var mockDateTime = (new Date(2013,10,13,0,0,0)).getTime();

            spyOn($, "cookie").andCallFake(function(){return undefined;});
            spyOn(Date, "now").andCallFake(function(){return mockDateTime;});

            _fakeGetCurrentLocation("http://businesscatalyst.com#access_token=febf7b6a027&expires_in=900");

            BCAPI.Helper.Site.getAccessToken()

            var expireDate = new Date(mockDateTime + 15 * 60 * 1000); // 900 = 15min
            expect($.cookie).toHaveBeenCalledWith('access_token','febf7b6a027', {expires: expireDate});
        });

        it("Test token is set in cookie with default expiration if not in hash parameters", function(){
            var mockDateTime = (new Date(2013,10,13,0,0,0)).getTime();

            spyOn($, "cookie").andCallFake(function(){return undefined;});
            spyOn(Date, "now").andCallFake(function(){return mockDateTime});

            _fakeGetCurrentLocation("http://businesscatalyst.com#access_token=febf7b6a027");

            BCAPI.Helper.Site.getAccessToken()

            //default expiration is 4h if none was passed
            var expireDate = new Date(mockDateTime + 4 * 60 * 60 * 1000); //4h default
            expect($.cookie).toHaveBeenCalledWith('access_token','febf7b6a027', { expires: expireDate});
        });

        it("Test it gets token from cookie if it's not in hash", function(){
            _fakeGetCurrentLocation("http://businesscatalyst.com");

            spyOn($, "cookie").andCallFake(function(){return true;});

            BCAPI.Helper.Site.getAccessToken();
            expect($.cookie).toHaveBeenCalledWith('access_token');
        });
    });
    
    it("Test getSiteId returns 'current'", function() {
        expect(BCAPI.Helper.Site.getSiteId()).toBe('current');
    });

    it("Test getRootUrl correct location.", function() {
    	var protocol = "https:",
    		hostname = "appkey-123-apps.worldsecuresystems.com",
    		expectedLocation = [protocol, "//", hostname].join(""),
    		wnd = {"location": {
    			"hostname": hostname,
    			"protocol": protocol
    		}};
    	
    	expect(BCAPI.Helper.Site.getRootUrl(wnd)).toBe(expectedLocation)
    });    
});

describe("Helper.Http", function(){

    function _getNumberOfOwnProperties(obj){
        var counter = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                counter++;
            }
        }
        return counter;
    }

    function _getMockLocation(location){
        var link = document.createElement("a");
        link.href = location;
        return link;
    }

    describe("Helper.Http.getQueryParameters", function(){
        it("Test if location is undefined", function(){
            var mockLocation = _getMockLocation();
            var params = BCAPI.Helper.Http.getQueryParameters(mockLocation);
            
            expect(_getNumberOfOwnProperties(params)).toBe(0);
        });

        it("Test if parameter string is empty (no ?)", function(){
            var mockLocation = _getMockLocation("http://app.businesscatalyst.com");
            var params = BCAPI.Helper.Http.getQueryParameters(mockLocation);
            
            expect(_getNumberOfOwnProperties(params)).toBe(0);
        });

        it("Check it returns correct number of parameters", function (){
            var mockLocation = _getMockLocation("http://app.businesscatalyst.com?param1=value1&param2=value2&param3=value3");
            var params = BCAPI.Helper.Http.getQueryParameters(mockLocation);

            expect(_getNumberOfOwnProperties(params)).toBe(3);
        });
    });

    describe("Helper.Http.getHashFragments", function(){
        it("Test if location is undefined", function(){
            var mockLocation = _getMockLocation();
            var params = BCAPI.Helper.Http.getHashFragments(mockLocation);
            
            expect(_getNumberOfOwnProperties(params)).toBe(0);
        });

        it("Test if parameter string is empty (no #)", function(){
            var mockLocation = _getMockLocation("http://app.businesscatalyst.com");
            var params = BCAPI.Helper.Http.getHashFragments(mockLocation);
            
            expect(_getNumberOfOwnProperties(params)).toBe(0);
        });

        it("Check it returns correct number of parameters", function (){
            var mockLocation = _getMockLocation("http://app.businesscatalyst.com#param1=value1&param2=value2&param3=value3");
            var params = BCAPI.Helper.Http.getHashFragments(mockLocation);

            expect(_getNumberOfOwnProperties(params)).toBe(3);
        });
    });

    describe("Helper.Http.getDecodedParameters", function(){
        it("Check it returns correct parameter", function (){
            var params = BCAPI.Helper.Http.getDecodedParameters('param1=value1');

            expect(_getNumberOfOwnProperties(params)).toBe(1);
            expect(params['param1']).toBe('value1');
        });

        it("Check it works with multiple parameters", function (){
            var params = BCAPI.Helper.Http.getDecodedParameters('param1=value1&param2=value2&param3=value3');

            expect(_getNumberOfOwnProperties(params)).toBe(3);
            expect(params['param1']).toBe('value1');
            expect(params['param2']).toBe('value2');
            expect(params['param3']).toBe('value3');
        });

        it("Check it ignores params without value", function(){
            var params = BCAPI.Helper.Http.getDecodedParameters('paramNoValue&paramWithValue=myValue');

            expect(_getNumberOfOwnProperties(params)).toBe(1);
            expect(params['paramNoValue']).toBe(undefined);
            expect(params['paramWithValue']).toBe('myValue');
        });

        it("Check it decodes param values", function(){
            var params = BCAPI.Helper.Http.getDecodedParameters('encodedParam=my%26Value');

            expect(params['encodedParam']).toBe('my&Value');
        });

    });

});