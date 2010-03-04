var limit =
    (function(){
        var context = this;
        
        function throttle(handler, interval, defer){
            var limitOn; // falsey
                
            interval = interval || 250; // milliseconds
            // defer is falsey by default
            
            return function(){
                if (!limitOn){
                    limitOn = true;
                    
                    window.setTimeout(function(){
                        if (defer){
                            handler.call(context);
                        }                            
                        limitOn = false;
                    }, interval);
                    
                    if (!defer){
                        handler.call(context);
                        return true;
                    }
                }
                return !limitOn;
            };
        }

        function attempt(handler, numberOfAttempts){
            numberOfAttempts = numberOfAttempts || 3; // it's the magic number
            
            return function(){
                if (numberOfAttempts){
                    if (!handler.call(context)){
                        numberOfAttempts--;
                    }
                    return true;
                }
                return false;
            };
        }
        
        // Allow a function to be called, as long as it doesn't trigger a throttle more than numberOfLives times
        function tripswitch(handler, throttleInterval, numberOfLives){
            return attempt(
                throttle(handler, throttleInterval),
                numberOfLives
            );
        }
        
        // Allow a function to be called, as long as it doesn't trigger a throttle more than numberOfLives times, within a certain period
        // TODO: Make a better name for this function (and for tripswitch)
        function tripswitchRenew(handler, throttleInterval, numberOfLives, period){
            var tripHandler = tripswitch(handler, throttleInterval, numberOfLives);
            period = period || 250; // milliseconds
            
            return function(){
                if (tripHandler()){
                    
                    // renew handler - TODO: make this more efficient(?)
                    window.setTimeout(function(){
                        tripHandler = tripswitch(handler, throttleInterval, numberOfLives);
                    }, period);
               }
            };
        }
        
        
        return {
            throttle: throttle,
            attempt: attempt,
            tripswitch: tripswitch,
            tripswitchRenew: tripswitchRenew
        };
        
    }());
