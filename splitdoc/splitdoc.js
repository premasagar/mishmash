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
        var html = $('html').html(); // an HTML document or fragment
        splitdoc(html); // returns object, containing key components of the HTML document
        splitdoc + ''; // a string version of the document; a full HTML document, whatever the input
        String(splitdoc(html)); // same as previous example
        
        splitdoc() + ''; // blank HTML document boilerplate
        
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
    
    function splitter(raw){
        var
            // cast raw to string
            html = typeof raw !== 'undefined' && raw !== null ? raw + '' : '',
        
            // default html document
            doctypeDefault = '<!doctype html>',
            headDefault = '<head><title></title></head>',
            bodyDefault = '<body></body>',
            
            // regular expressions to match supplied document
            doctypeRegex = /<!doctype html[^>]*>/i,
            htmlAttrRegex = /<html([^>]*)>/i,
            headRegex = /<head([^>]*)>(.*?)<\/head>/i, // <head> and the first available </head>, with backrefs: 1) head attributes 2) contents
            bodyRegex = /<body([^>]*)>(.*?)<\/body>/i, // <body> and the first available </body>, with backrefs: 1) body attributes 2) contents
        
            // match the supplied document
            doctypeMatch = html.match(doctypeRegex),
            htmlAttrMatch = html.match(htmlAttrRegex),
            headMatch = html.match(headRegex),
            bodyMatch = html.match(bodyRegex),
            
            // construct complete component, using defaults if required
            // NOTE: attribute values are deliberately left untrimmed
            doctype = doctypeMatch ? doctypeMatch[0] : doctypeDefault,            
            htmlAttr = htmlAttrMatch ? htmlAttrMatch[1] : '',
            
            headAttr = headMatch ? headMatch[1] : '',
            headContents = trim(headMatch ? headMatch[2] : ''),
            
            bodyAttr = bodyMatch ? bodyMatch[1] : '',
            bodyContents = trim(bodyMatch ? bodyMatch[2] : html);
            
            
        // api into html document
        // NOTE: there is redundancy here, e.g. value of 'headContents' is already contained within value of 'head'.
        return {
            doctype: doctype,
            htmlAttr: htmlAttr,
            
            head: function(){
                return headMatch ? headMatch[0] : headDefault.split('><').join(headAttr + '>' + headContents + '<');
            },
            headAttr: headAttr,
            headContents: headContents,
            
            body: function(){
                return bodyMatch ? bodyMatch[0] : bodyDefault.split('><').join(bodyAttr + '>' + bodyContents + '<');
            },
            bodyAttr: bodyAttr,
            bodyContents: bodyContents,
            
            // enhance the object's string representation, by overriding Object prototype's toString function
            toString: function(){
                return doctype + '<html' + htmlAttr + '>' + this.head() + this.body() + '</html>';
            }
        };
    }
    
    return (exports.splitdoc = splitter);
}());
