var numb = {
    /*
        random integer
        call it with the length of an array; returns a random
        index or, if no argument suppplied, returns 0 or 1

        e.g.
        randomInt(); // will return 0 or 1
        randomInt(3); // will return 0, 1 or 2

        var colors = ['red', 'blue', 'green'];
        colors[randomInt(colors.length)]; // 'red', 'green' or 'blue'
    */
    randomInt: function(length){
        return Math.ceil((length || 2) * Math.random()) - 1;
    },

    selectInRange: function(factor, min, max){
        return factor * (max - min) + min;
    },

    randomInRange: function(min, max){
        return this.selectInRange(Math.random(), min, max);
    },

    randomIntRange: function(min, max){
        return this.randomInt(max + 1 - min) + min;
    },

    round: function(num, decimalplaces){
        return Number(num.toFixed(decimalplaces));
    }
};