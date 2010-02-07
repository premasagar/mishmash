// Parse an atom date string and return as a JS Date object. E.g. '2007-10-29+ '-' T23:39:38+06:00'
function atomdate(d){
    return typeof d === 'string' ?
        // Convert Atomdate string to native Date object
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
        
        // Date object (or object with the same API as Date)
        (function toAtomdate(date){
            function leadingZeroes(num){
				var len = String(num).length;
				if (len > 2){
				    return num;
				}
				return len === 2 ? num : '0' + num;
			}
			var timezone = -atomdate('2009-08-02T00:39:00z').getTimezoneOffset() / 60;
			if (!timezone){
			    timezone = 'z';
			}
			else {
			    timezone = (timezone > 0 ? '+' : '-') + leadingZeroes(Math.abs(timezone)) + ':00'; // TODO: accept part-hours
			}
        
            return date.getFullYear() + '-' + leadingZeroes(date.getMonth() + 1) + '-'  + leadingZeroes(date.getDate()) + 'T' + leadingZeroes(date.getHours()) + ':' + leadingZeroes(date.getMinutes()) + ':' + leadingZeroes(date.getSeconds()) + timezone;
        }(d));
}
