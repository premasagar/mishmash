'use strict';

/*!
* splitdoc
*   github.com/premasagar/mishmash/tree/master/splitdoc/
*
*//*
    split an HTML doc into component sections
        e.g. doctype, head, body, body content, scripts, styles, images, media, links
        with a simple JavaScript jQuery api

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*//*
    creates method
        splitdoc
        
    examples
        // a complete HTML document or fragment (string)
        var html = '<p>blah</p>';
        
        // returns object, containing key components of the HTML document
        splitdoc(html);
        
        // a string version of the document, which is a full HTML document, no matter what the input
        splitdoc(html) + '';
        
        // same as previous example
        splitdoc(html).toString();
        
        // blank HTML document boilerplate
        // returns '<!doctype html><html><head><title></title></head><body></body></html>'
        splitdoc() + '';
        
    notes
        The script attempts absolutely no valdation. It simply works with what it would expect from a valid document or fragment.
        
    TODO
        handle IE conditional tags and the blocks they enclose

*//*
    jslint browser: true, devel: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true
*/

var splitdoc = (function(){
    var exports = exports || {};
    
    function trim(str){
        return str.replace(/^[\0\t\n\v\f\r\s]+|[\0\t\n\v\f\r\s]+$/g, ''); // match the full set of whitespace characters
    }
    
    function Splitdoc(raw){
        var
            // cast raw to string
            html = typeof raw !== 'undefined' && raw !== null ? raw + '' : '',
        
            // default html document
            doctypeDefault = '<!doctype html>',
            
            // regular expressions to match supplied document
            doctypeRegex = /<!doctype html[^>]*>/i,
            htmlAttrRegex = /<html([^>]*)>/i,
            headRegex = /<head([^>]*)>(.*?)<\/head>/i, // <head> and the first available </head>, with backrefs: 1) head attributes 2) contents
            bodyRegex = /<body([^>]*)>(.*?)<\/body>/i, // <body> and the first available </body>, with backrefs: 1) body attributes 2) contents
        
            // match the supplied document
            doctypeMatch = html.match(doctypeRegex),
            htmlAttrMatch = html.match(htmlAttrRegex),
            headMatch = html.match(headRegex),
            bodyMatch = html.match(bodyRegex);
        
        // api into document
        // NOTE: attributes are deliberately left untrimmed
        this.doctype = doctypeMatch ? doctypeMatch[0] : doctypeDefault;
        this.htmlAttr = htmlAttrMatch ? htmlAttrMatch[1] : '';
        this.headAttr = headMatch ? headMatch[1] : '';
        this.headContents = trim(headMatch ? headMatch[2] : '');
        this.bodyAttr = bodyMatch ? bodyMatch[1] : '';
        this.bodyContents = trim(bodyMatch ? bodyMatch[2] : (doctypeMatch || headMatch ? '' : html));
    }
    
    // Prototype
    Splitdoc.prototype = {
        head: function(){
            return '<head' + this.headAttr + '>' + this.headContents + '</head>';
        },
        body: function(){
            return '<body' + this.bodyAttr + '>' + this.bodyContents + '</body>';
        },
        // enhance the object's string representation, by overriding Object prototype's toString function
        toString: function(){
            return this.doctype + '<html' + this.htmlAttr + '>' + this.head() + this.body() + '</html>';
        }
    };
    
    function splitdoc(html){
        return new Splitdoc(html);
    }
    
    return (exports.splitdoc = splitdoc);
}());
