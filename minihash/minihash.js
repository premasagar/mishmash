// TODO: minihash("d") gives infinite loop; minihash("\\") === minihash("b");

function minihash(str){
    if (!str){
        return "";
    }

    // Convert a number string to hexadecimal
    function hex(numStr){
        return Number(numStr).toString(16);
    }

    // Split a number string into two, and reduce the string by adding each half together
    function splitAndAdd(numStr){
        var maxLen = 8,
            mid = Math.floor(numStr.length / 2),
            start = numStr.slice(0, mid),
            end = numStr.slice(mid);
        
        if (!mid){
            return numStr;
        }
        else if (mid > maxLen){
            return splitAndAdd(start) + splitAndAdd(end);
        }
        return String(Number(start) + Number(end));
    }

    // Split a number string into two, and increase a number string by mutiplying each half together and squaring
    function mergeAndMultiply(numStr){
        var maxLen = 4,
            mid = Math.floor(numStr.length / 2),
            start = numStr.slice(0, mid),
            end = numStr.slice(mid);

        if (!mid){
            return numStr;
        }
        else if (mid > maxLen){
            return mergeAndMultiply(start) + mergeAndMultiply(end);
        }
        return String(Math.pow(Number(start) * Number(end), 2));
    }

    // **

    var // Final string length
        finalLength = 32,
        // Seed string with character codes of each char
        charCodes = jQuery.map(str, function(char){
            return char.charCodeAt(0);
        }).join("");

    // Reduce string length
    while(charCodes.length > finalLength + 1){ // Note, +1 is to account for string reduction in conversion to hexadecimal
        charCodes = splitAndAdd(charCodes);
    }

    // Increase string length
    while(charCodes.length < finalLength + 1){
        charCodes = mergeAndMultiply(charCodes);
    }

    return jQuery.map(charCodes, function(char, i){
        // Create hex numbers for each block of 8 digits
        if (i && !(i % 8)){
            return hex(charCodes.slice(i - 8, i));
        }
    }).join("").slice(0, finalLength);
}

minihash("apple");
