// Parse an atom date string and return as a JS Date object. E.g. '2007-10-29+ '-' T23:39:38+06:00'
// TODO: Detect if arg is Date obj, and return as Atom date string
function atomdate(d){
    return typeof d === 'string' ?
        // Convert Atomdate string to native Date object
        (function fromAtomdate(atomdate){
	        var d, n, plusminus;
	
	        // Convert 'Z' UTC to '+00:00' and split to array
	        atomdate = atomdate.replace(/z$/i, '+00:00');
	        d = atomdate.split(/[\-T:+]/);  // TODO: Confirm this is fine in IE6
	        n = Number;
		
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
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-'  + date.getDate() + 'z';
        }(d));
}
