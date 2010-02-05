'use strict';

/*!
* Dataset
*   github.com/premasagar/mishmash/tree/master/dataset/
*
*//*
    returns the 'dataset' object of an element, or a read-only object that mimics it

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*//*
    'dataset' object
        This is new in HTML5. It is a hash of key-value pairs, based on those of the element's attributes whose names have the prefix 'data-'.
     
    see
        http://ejohn.org/blog/html-5-data-attributes/
        http://dev.w3.org/html5/spec/Overview.html#custom
*/
 
function dataset(elem){
    return elem.dataset ||
        (function(){
            for (
                var
                    dataset = {},
                    attrs = elem.attributes,
                    i = attrs.length,
                    attr, attrName;
                 i;
                 i--
            ){
                attr = attrs[i-1];
                attrName = attr.name;
                if (attrName.slice(0,5) === 'data-'){
                    dataset[attrName.slice(5)] = attr.value;
                }
            }
            return dataset;
            // NOTE: this is a read-only hash. If you need to set a data property, where the browser does not support the 'dataset' object, then use: elem.setAttribute('data-' + name, value);
        }());
}

/*jslint browser: true, devel: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
