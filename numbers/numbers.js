// Numbers
var numbers;

(function($){
	var config;

	config = {
		range: {
			min: 1,
			max: 3200
		}
	};

	//////////////////////////////////////////////////////////


	$.extend($, {
		// Debug log
		_: function() {
			var payload;
			if (arguments.length === 1){
				payload = arguments[0];
			}
			else {
				payload = [];
				$.each(arguments, function(){
					payload.push(this);
				});
			}
			if (typeof console !== 'undefined' && typeof console.log !== 'undefined'){ // Firebug console
				console.log(payload);
			}
			else {
				try {
					alert((typeof payload === 'object' && payload !== null) ? payload.toSource() : payload);
				}
				catch(e){
					alert('DEBUG: Could not convert toSource: ' + payload);
				}
			}
			// $('body').prepend('<code>' + payload.toSource() + '</code>');
		},
		
		isArray: function(obj){
			return obj && obj.constructor.toString().indexOf("Array") !== -1;
		},
		
		num: {
			// Sum of numbers or arrays of numbers
			sum: function(){
				var sum, total;
				sum = arguments.callee;
				total = 0;
				$.each(arguments, function(i, n){ // Add this number, or recursively sum this array
					if (typeof n === 'number'){
						total += n;
					}
					else if ($.isArray(n)){
						total += sum.apply(null, n);
					}
				});
				return total;
			},
			
			// Sort an array of numbers numerically, not alphabetically
			sortNumeric: function(numbers){			
				return numbers.sort(function(a, b){
					return a - b;
				});
			},
			
			// Sort an array of objects by an arbitrary property
			/* sortBy: function(arr, prop){			
				return arr.sort(function(a, b){
					if (typeof a[prop] === 'undefined' || typeof b[prop] === 'undefined'){
						return 0;
					}		
					if (a[prop] > b[prop]){
						return 1;
					}
					if (a[prop] < b[prop]){
						return -1;
					}
					return 0;
				});
			}, */
			
			// experimental
			N: $.extend(function(n){
				this.n = n;
			}, {
				prototype:$.extend(Number.prototype, {
					valueOf: function(){
						return this.n;
					}
				})
			}),
			
			
			Num: $.extend(function(num){
				this.num = Number(num);
			}, {
				prototype: {
					getFactors: function(){ // factors should have sum() method that employs cache - not use sum prop
						function total(){
							var total = arguments.callee;
							if (!total.cache){
								total.cache = $.num.sum(this);
							}
							return total.cache;
						}
					
						var i;		
						if (!this.factors){
							this.factors = [1];
							for (i=2; i <= Math.sqrt(this.num); i++){
								if (this.num % i === 0){
									this.factors.push(i, this.num/i);
								}
							}
							$.num.sortNumeric(this.factors);
							this.factors.total = total;
						}
						return this.factors;
					},
					
					isPrime: function(){
						return this.getFactors().length === 1;
					},
					
					isAbundant: function(){
						return this.getFactors().total() > this.num;
					},
					
					isDeficient: function(){
						return !this.isAbundant();
					},
					
					isPerfect: function(){
						return this.getFactors().total() === this.num;
					},
					
					getAbundance: function(){
						if (typeof this.abundance === 'undefined'){
							this.abundance = (this.getFactors().total() / (2 * Math.SQRT2 * this.num));
						}
						return this.abundance;
					},
					
					html: function(){
						var html, classNames, brightness;
					
						classNames = [];
						/* if (typeof this.html !== 'undefined'){
							return this.html;
						} */
						if (this.isPrime()){
							classNames.push('prime', 'deficient');
						}
						else if (this.isDeficient()){
							classNames.push('deficient');
						}
						else if (this.isAbundant()){
							classNames.push('abundant');
						}
						else if (this.isPerfect()){
							classNames.push('perfect');
						}
						$.each(this.getFactors(), function(){
							classNames.push('f' + String(this));
						});
						
						brightness = Math.round(this.getAbundance() * 255);
						html = '<li ' +
							'id="n' + this.num + '" ' +
							'class="' + classNames.join(' ') + '" ' +
							'title="' + this.num + ', Factors: ' + this.getFactors().join(', ') + '"' +
							'style="background-color:rgb(0,' + brightness + ',0);" ' +
							'></li>';
						return html;
					},

					node: function(){
						return $(this.html()).get(0);
					}
				}
			}),
			
			Range: $.extend(function(min, max){
				$.extend(this, {
					min: min,
					max: max
				});
				this.init();
			}, {
				prototype: {
					numbers: [],
					init: function(){
						var n;
						for (n = this.min; n <= this.max; n++){
							this.numbers.push(new $.num.Num(n));
						}
					},
					
					html: function(){
						var that, start, html;
						
						that = this;
						start = new Date();
						html = '';
						
						$.each(this.numbers, function(i, n){
							html += n.html();
							
							if (that.numbers.length === i + 1){
								$('#container')
									.append('<ol id="numbers">' + html + '</ol>');	
							}
							window.setTimeout(function(){
								$('#completed')
									.text(Math.round(((i + 1) / that.numbers.length) * 100));
								$('#time')
									.text((new Date() - start) / 1000);
							}, 0);
						});			
						return true;
						
						function iterator(){
							var iterator, completion;
							
							iterator = arguments.callee;
							if (typeof iterator.count === 'undefined'){
								iterator.count = 0;
							}
							completion = Math.round((iterator.count / that.numbers.length) * 100);
							if (completion !== Math.round((iterator.count-1 / that.numbers.length) * 100)){
								$._('done');
							}							
						}
						
						function getListItem(){
							// Get list item
							outerFunc.list.appendChild(that.numbers[outerFunc.counter++].node());
							
							// If still more to process
							if (outerFunc.counter < that.numbers.length){
								// % Report
								var pc = Math.round((outerFunc.counter / that.numbers.length) * 100);
								if (pc !== Math.round((outerFunc.counter-1 / that.numbers.length) * 100)){
									outerFunc.completed.replaceChild(cTN(pc), outerFunc.completed.firstChild);
								}
								// Set up next iteration
								window.setTimeout(innerFunc, 0);
							}
							
							// End
							else {
								//gEBI('report').parentNode.removeChild(gEBI('report'));
								gEBI('container').appendChild(outerFunc.list);
								var end	= new Date();
								outerFunc.report.innerHTML = ((end - start) / 1000) + 's';
							}
						}
					
						var that = this;
						var innerFunc = getListItem;
						var outerFunc = $.extend(arguments.callee, {
							counter:0,
							list: $.extend(cE('ol'), {
								id: 'numbers',
								className: 'xoxo'
							}),
							report: $.extend(cE('p'),{
								id: 'report'
							}),
							completed: $.extend(cE('span'), {
								id: 'completed'
							})
						});
						outerFunc.completed.appendChild(cTN('0'));
						outerFunc.report.appendChild(outerFunc.completed);
						outerFunc.report.appendChild(cTN('% complete'));
						gEBI('container').appendChild(outerFunc.report);
						innerFunc();
						
						/* for (var i=0; i<this.numbers.length; i++){
							var num = this.numbers[i];
							this.list.appendChild(num.node());
						} */
						return outerFunc.list;
					},
					
					node: function(){
						var start = new Date();
						function getListItem(){
							// Get list item
							outerFunc.list.appendChild(that.numbers[outerFunc.counter++].node());
							
							// If still more to process
							if (outerFunc.counter < that.numbers.length){
								// % Report
								var pc = Math.round((outerFunc.counter / that.numbers.length) * 100);
								if (pc !== Math.round((outerFunc.counter-1 / that.numbers.length) * 100)){
									outerFunc.completed.replaceChild(cTN(pc), outerFunc.completed.firstChild);
								}
								// Set up next iteration
								window.setTimeout(innerFunc, 0);
							}
							
							// End
							else {
								//gEBI('report').parentNode.removeChild(gEBI('report'));
								gEBI('container').appendChild(outerFunc.list);
								var end	= new Date();
								outerFunc.report.innerHTML = ((end - start) / 1000) + 's';
							}
						}
					
						var that = this;
						var innerFunc = getListItem;
						var outerFunc = $.extend(arguments.callee, {
							counter:0,
							list: $.extend(cE('ol'), {
								id: 'numbers',
								className: 'xoxo'
							}),
							report: $.extend(cE('p'),{
								id: 'report'
							}),
							completed: $.extend(cE('span'), {
								id: 'completed'
							})
						});
						outerFunc.completed.appendChild(cTN('0'));
						outerFunc.report.appendChild(outerFunc.completed);
						outerFunc.report.appendChild(cTN('% complete'));
						gEBI('container').appendChild(outerFunc.report);
						innerFunc();
						
						/* for (var i=0; i<this.numbers.length; i++){
							var num = this.numbers[i];
							this.list.appendChild(num.node());
						} */
						return outerFunc.list;
					}
				}
			})
		}
	});
	
	
	// Dom Shortcuts
	function cE(nodeType){
		return document.createElement(nodeType);
	}
	function cTN(text){
		return document.createTextNode(text);
	}
	function gEBI(id){
		return document.getElementById(id);
	}

	numbers = new $.num.Range(config.range.min, config.range.max);
	//numbers.node();
	//gEBI('numbers').appendChild(numbers.node());
	numbers.html();
})(jQuery);


/*
Interesting column widths:
	111 
	123
*/