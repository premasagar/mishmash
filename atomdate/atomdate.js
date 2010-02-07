'use strict';

/*!
* Atomdate
*   github.com/premasagar/mishmash/tree/master/atomdate/
*
*//*
    convert Atom date string to native JavaScript Date object instance, and vice versa

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*//*
    usage
        atomdate('2007-10-29T23:39:38+06:00');
        // returns native Date object
        
        atomdate(new Date);
        // returns Atom date string
        
    **

    limitations
        currently, when passing an Atom string, it must include full time information - i.e. YYYY-MM-DDTHH:MM:SS+Z - this restriction should be relaxed in future
        
        when converting an Atom date string to a Date object, the timezone of the Atom string will automatically be converted to the user's locale - this is a limitation of the native Date object

*/

// Argument is either an Atom date string, or a Date instance
function atomdate(d){
    return typeof d === 'string' ?
        // Parse an atom date string and return as a native Date object
        // e.g. atomdate('2007-10-29T23:39:38+06:00');
        // TODO: Make this more forgiving - e.g. without seconds, minutes, hours, date, or month
        (function fromAtomdate(atomdate){
	        var d, n, plusminus;
	
	        // Convert 'Z' UTC to '+00:00' and split to array
	        atomdate = atomdate.replace(/z$/i, '+00:00');
	        d = atomdate.split(/[\-T:+]/);
	        n = Number; // NOTE: Number casting required for older Opera browsers
		
	        if (d.length !== 8){
		        return false;
	        }              
	        // Timezone + / -
	        plusminus = atomdate.substr(19,1);
	
		        return new Date(
		        Date.UTC(
			        n(d[0]),            // year
			        n(d[1] - 1),        // month
			        n(d[2]),            // day
			        n(d[3] - n(plusminus + d[6])),  // hour
			        n(d[4] - n(plusminus + d[7])),  // mins
			        n(d[5])              // secs
		        )
	        );
        }(d))
        
        :
        
        // Returns an Atom string, when passed a native Date object instance (or an object with the same API as a Date instance)
        (function toAtomdate(date){
            // Pad a number string with a leading zero, if num is a single digit. If num is two digits, then leave untouched. Don't use for negative numbers.
            function leadingZero(num){
				return String(num).length > 1 ? num : '0' + num;
			}
			// Determine the timezone string, according to the current user's locale
			function timezone(date){
			    var
			        timezoneMins = 0 - date.getTimezoneOffset(),
			        plusminus = timezoneMins < 0 ? '-' : '+',
			        timezoneMinsAbs = Math.abs(timezoneMins);
			        
			    return timezoneMinsAbs ?
		            plusminus + leadingZero(Math.floor(timezoneMinsAbs / 60)) + ':' + leadingZero(timezoneMinsAbs % 60) :
		            'z';
			}
        
            return date.getFullYear() + '-' + leadingZero(date.getMonth() + 1) + '-'  + leadingZero(date.getDate()) + 'T' + leadingZero(date.getHours()) + ':' + leadingZero(date.getMinutes()) + ':' + leadingZero(date.getSeconds()) + timezone(date);
        }(d));
}
